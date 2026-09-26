'use client';

import { DollarSign, FileText, ArrowUpRight } from 'lucide-react';

type PaymentRecord = {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded';
  description: string;
};

export default function DashboardPaymentsTab({
  role,
  payments = [],
}: {
  role: 'student' | 'teacher';
  payments?: PaymentRecord[];
}) {
  const totalAmount = payments.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-stone-200/80 dark:border-stone-800 pb-3">
        <h2 className="font-display text-xl sm:text-2xl font-black tracking-tight text-stone-950 dark:text-white">
          {role === 'student' ? 'Billing & Payments' : 'Payment History'}
        </h2>
        <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
          {role === 'student' 
            ? 'View your payment history and download invoices for past lessons.' 
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
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total {role === 'student' ? 'Spent' : 'Earned'}</p>
              <p className="font-display text-2xl font-black text-stone-950 dark:text-white">${totalAmount.toFixed(2)}</p>
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
                {role === 'student' && <th className="px-6 py-4 font-bold text-right text-stone-900 dark:text-stone-100">Invoice</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={role === 'student' ? 5 : 4} className="px-6 py-12 text-center text-stone-500">
                    No payment history found.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="px-6 py-4 text-stone-600 dark:text-stone-400">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-stone-900 dark:text-stone-100">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        payment.status === 'paid' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                        payment.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                        'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-display font-bold text-stone-900 dark:text-white">
                      ${payment.amount.toFixed(2)}
                    </td>
                    {role === 'student' && (
                      <td className="px-6 py-4 text-right">
                        <button className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline">
                          <FileText className="h-3 w-3" />
                          Receipt
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
