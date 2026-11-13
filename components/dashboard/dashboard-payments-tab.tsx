'use client';

import { useState } from 'react';
import { DollarSign, FileText, Printer, X, CheckCircle2, ShieldCheck } from 'lucide-react';

export type PaymentRecord = {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded' | 'refund_due' | 'not_refunded';
  description: string;
};

export default function DashboardPaymentsTab({
  role,
  payments = [],
}: {
  role: 'student' | 'teacher';
  payments?: PaymentRecord[];
}) {
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentRecord | null>(null);

  // Payment records mirror the database and cannot be deleted from the UI.
  const displayPayments = payments;
  const totalAmount = displayPayments.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0);
  const STATUS_LABEL: Record<PaymentRecord['status'], string> = {
    paid: 'Paid',
    pending: 'Awaiting payment',
    refunded: 'Refunded',
    refund_due: 'Cancelled · refund due',
    not_refunded: 'Cancelled < 24h · not refundable',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-stone-200/80 dark:border-stone-800 pb-3">
        <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-stone-950 dark:text-white">
          {role === 'student' ? 'Billing & Payments' : 'Payment History'}
        </h2>
        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
          {role === 'student'
            ? 'Every lesson payment, with the exact amount charged by Stripe.'
            : 'Track your earnings and payout history for completed lessons.'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Total {role === 'student' ? 'Spent' : 'Earned'}
              </p>
              <p className="font-display text-2xl font-black text-stone-950 dark:text-white">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/50 dark:bg-stone-800/50">
              <tr>
                <th className="px-6 py-4 font-bold text-stone-900 dark:text-stone-100">Date</th>
                <th className="px-6 py-4 font-bold text-stone-900 dark:text-stone-100">Description</th>
                <th className="px-6 py-4 font-bold text-stone-900 dark:text-stone-100">Status</th>
                <th className="px-6 py-4 font-bold text-right text-stone-900 dark:text-stone-100">Amount</th>
                <th className="px-6 py-4 font-bold text-right text-stone-900 dark:text-stone-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {displayPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                    No payment history found.
                  </td>
                </tr>
              ) : (
                displayPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                      {new Date(payment.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-stone-900 dark:text-stone-100">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          payment.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : payment.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                            : 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                        }`}
                      >
                        {STATUS_LABEL[payment.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-display font-bold text-stone-950 dark:text-white">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {role === 'student' && payment.status === 'paid' && (
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(payment)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                          >
                            <FileText className="h-3 w-3" />
                            Receipt
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 sm:p-8 shadow-2xl space-y-6">
            <button
              type="button"
              onClick={() => setSelectedReceipt(null)}
              className="absolute right-4 top-4 rounded-xl p-1.5 text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-stone-150 dark:border-stone-800 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-stone-950 dark:text-white">
                  Payment Receipt
                </h3>
                <p className="text-xs text-stone-400">
                  ES Global Language Academy
                </p>
              </div>
            </div>

            {/* Receipt Details */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Transaction ID</span>
                <span className="font-mono text-xs font-semibold text-stone-800 dark:text-stone-200">
                  {selectedReceipt.id.slice(0, 16)}...
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Date</span>
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  {new Date(selectedReceipt.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Description</span>
                <span className="font-medium text-stone-800 dark:text-stone-200">
                  {selectedReceipt.description}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Status</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Paid
                </span>
              </div>
              <div className="border-t border-stone-150 dark:border-stone-800 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-stone-900 dark:text-white">Total Amount</span>
                <span className="font-display text-2xl font-black text-stone-950 dark:text-white">
                  ${selectedReceipt.amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Print / Download Button */}
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 dark:bg-stone-100 py-3 text-xs font-bold uppercase tracking-wider text-white dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-white shadow-sm transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
