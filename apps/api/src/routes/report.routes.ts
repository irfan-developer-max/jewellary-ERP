import { Router } from 'express';
import { prisma } from '@erp/db';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';

export const reportRouter: Router = Router();

reportRouter.use(authenticate);
reportRouter.use(authorize('ADMIN', 'STAFF'));

// GET /api/v1/reports/overview
reportRouter.get('/overview', async (req, res, next) => {
  try {
    const { from, to } = req.query as { from?: string; to?: string };

    const dateWhere: Record<string, unknown> = {};
    if (from || to) {
      dateWhere.createdAt = {};
      if (from) (dateWhere.createdAt as any).gte = new Date(from);
      if (to) (dateWhere.createdAt as any).lte = new Date(to);
    }

    const completedSalesWhere = {
      status: 'COMPLETED' as const,
      ...dateWhere,
    };

    // 1. Sales Aggregates
    const [salesAgg, totalCompletedCount, voidedCount] = await Promise.all([
      prisma.sale.aggregate({
        where: completedSalesWhere,
        _sum: {
          subtotal: true,
          totalDiscount: true,
          taxableAmount: true,
          cgst: true,
          sgst: true,
          igst: true,
          grandTotal: true,
          amountPaid: true,
          creditAmount: true,
        },
      }),
      prisma.sale.count({ where: completedSalesWhere }),
      prisma.sale.count({ where: { status: 'VOIDED', ...dateWhere } }),
    ]);

    // 2. Payment Modes Breakdown
    const payments = await prisma.payment.groupBy({
      by: ['mode'],
      where: {
        sale: completedSalesWhere,
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // 3. Current Live Gold Rates (latest per purity)
    const purities = ['K24', 'K22', 'K18', 'K14'] as const;
    const goldRates = await Promise.all(
      purities.map(async (purity) => {
        const rate = await prisma.goldRate.findFirst({
          where: { purity },
          orderBy: { effectiveFrom: 'desc' },
        });
        return {
          purity,
          ratePerGm: rate ? Number(rate.ratePerGm) : 0,
          updatedAt: rate ? rate.effectiveFrom : null,
        };
      })
    );
    const rateMap = Object.fromEntries(goldRates.map((r) => [r.purity, r.ratePerGm]));

    // 4. Products & Stock by Purity
    const activeProducts = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        goldPurity: true,
        grossWeight: true,
        netWeight: true,
        currentStock: true,
        purchasePrice: true,
        categoryId: true,
        category: { select: { name: true } },
      },
    });

    let totalStockUnits = 0;
    let totalGrossWeight = 0;
    let totalNetWeight = 0;
    let estimatedStockValuation = 0;

    const purityBreakdown: Record<string, { units: number; netWeight: number; grossWeight: number; valuation: number }> = {
      K24: { units: 0, netWeight: 0, grossWeight: 0, valuation: 0 },
      K22: { units: 0, netWeight: 0, grossWeight: 0, valuation: 0 },
      K18: { units: 0, netWeight: 0, grossWeight: 0, valuation: 0 },
      K14: { units: 0, netWeight: 0, grossWeight: 0, valuation: 0 },
    };

    const categoryMap: Record<string, { name: string; count: number; netWeight: number }> = {};

    for (const prod of activeProducts) {
      const stock = prod.currentStock || 0;
      const net = Number(prod.netWeight) * stock;
      const gross = Number(prod.grossWeight) * stock;
      const purity = prod.goldPurity as keyof typeof purityBreakdown;
      const currentRate = rateMap[purity] || 0;
      const val = net * currentRate;

      totalStockUnits += stock;
      totalGrossWeight += gross;
      totalNetWeight += net;
      estimatedStockValuation += val;

      if (purityBreakdown[purity]) {
        purityBreakdown[purity].units += stock;
        purityBreakdown[purity].netWeight += net;
        purityBreakdown[purity].grossWeight += gross;
        purityBreakdown[purity].valuation += val;
      }

      const catName = prod.category?.name || 'Uncategorized';
      if (!categoryMap[catName]) {
        categoryMap[catName] = { name: catName, count: 0, netWeight: 0 };
      }
      categoryMap[catName].count += stock;
      categoryMap[catName].netWeight += net;
    }

    // 5. Customer Dues
    const [duesSummary, overdueSummary] = await Promise.all([
      prisma.customerDue.aggregate({
        where: { status: { in: ['PENDING', 'PARTIAL'] } },
        _sum: { balanceAmount: true, originalAmount: true, paidAmount: true },
        _count: { id: true },
      }),
      prisma.customerDue.aggregate({
        where: {
          status: { in: ['PENDING', 'PARTIAL'] },
          dueDate: { lt: new Date() },
        },
        _sum: { balanceAmount: true },
        _count: { id: true },
      }),
    ]);

    // 6. Recent Sales (up to 30)
    const recentSales = await prisma.sale.findMany({
      where: completedSalesWhere,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        payments: { select: { mode: true, amount: true } },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    res.json({
      ok: true,
      data: {
        sales: {
          totalCompletedCount,
          voidedCount,
          grandTotal: Number(salesAgg._sum.grandTotal || 0),
          taxableAmount: Number(salesAgg._sum.taxableAmount || 0),
          cgst: Number(salesAgg._sum.cgst || 0),
          sgst: Number(salesAgg._sum.sgst || 0),
          igst: Number(salesAgg._sum.igst || 0),
          totalDiscount: Number(salesAgg._sum.totalDiscount || 0),
          amountPaid: Number(salesAgg._sum.amountPaid || 0),
          creditAmount: Number(salesAgg._sum.creditAmount || 0),
        },
        payments: payments.map((p) => ({
          mode: p.mode,
          amount: Number(p._sum.amount || 0),
          count: p._count.id,
        })),
        goldRates,
        inventory: {
          totalProducts: activeProducts.length,
          totalStockUnits,
          totalGrossWeightGrams: Math.round(totalGrossWeight * 1000) / 1000,
          totalNetWeightGrams: Math.round(totalNetWeight * 1000) / 1000,
          estimatedStockValuation: Math.round(estimatedStockValuation),
          purityBreakdown,
          categories: Object.values(categoryMap),
        },
        dues: {
          totalPendingCount: duesSummary._count.id || 0,
          totalOutstanding: Number(duesSummary._sum.balanceAmount || 0),
          totalOriginal: Number(duesSummary._sum.originalAmount || 0),
          totalRecovered: Number(duesSummary._sum.paidAmount || 0),
          overdueCount: overdueSummary._count.id || 0,
          overdueAmount: Number(overdueSummary._sum.balanceAmount || 0),
        },
        recentSales,
      },
    });
  } catch (err) {
    next(err);
  }
});
