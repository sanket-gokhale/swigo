'use client';
import React, { useEffect, useState } from 'react';
import { getAuthJSON, patchAuthJSON } from '@/services/api';
import toast from 'react-hot-toast';

export default function OwnerRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Time changed');

  const fetchRequests = async () => {
    try {
      const data = await getAuthJSON('/bookings/owner/requests');
      setRequests(data.data || data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'confirmed' | 'rejected', reason?: string) => {
    try {
      await patchAuthJSON(`/bookings/${id}/status`, {
        status,
        rejectionReason: reason
      });
      toast.success(`Request ${status}`);
      setRejectingId(null);
      fetchRequests();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="space-y-6">
    {[1,2,3].map(i => <div key={i} className="h-32 bg-zinc-100 animate-pulse rounded-3xl" />)}
  </div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Booking Requests</h1>
        <p className="mt-2 text-zinc-500">Manage incoming interests and potential tenants.</p>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed border-zinc-800 bg-zinc-950/50">
          <p className="text-zinc-500">No booking requests found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req) => (
            <div key={req._id} className="group relative rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-8 shadow-2xl transition-all hover:shadow-primary/5 hover:border-zinc-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/5 flex items-center justify-center text-primary text-lg sm:text-xl font-bold flex-shrink-0">
                      {req.user?.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-zinc-50 truncate">{req.user?.name}</h3>
                      <p className="text-sm text-zinc-400 truncate">{req.user?.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div><span className="text-zinc-500 font-medium">Property:</span> <span className="font-semibold text-zinc-200">{req.property?.title}</span></div>
                    <div><span className="text-zinc-500 font-medium">Date:</span> <span className="font-semibold text-zinc-200">{new Date(req.startDate).toLocaleDateString()}</span></div>
                    {req.visitTime && (
                      <div><span className="text-zinc-500 font-medium">Visit Time:</span> <span className="font-semibold text-zinc-200">{req.visitTime}</span></div>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-400 italic">"{req.message}"</p>
                </div>

                <div className="flex flex-col items-stretch gap-2 w-full md:w-auto md:min-w-[200px]">
                  {req.status === 'pending' ? (
                    rejectingId === req._id ? (
                      <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-300">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Select Reason</label>
                        <select 
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-red-500/20"
                        >
                          <option>Time changed</option>
                          <option>Limit reached</option>
                          <option>Other</option>
                        </select>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleStatusUpdate(req._id, 'rejected', rejectionReason)}
                            className="flex-1 rounded-xl bg-red-600 py-3 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button 
                            onClick={() => setRejectingId(null)}
                            className="flex-1 rounded-xl border border-zinc-800 bg-white/5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:bg-white/10 transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleStatusUpdate(req._id, 'confirmed')}
                          className="w-full rounded-xl bg-primary py-3 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-95 cursor-pointer"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => {
                            setRejectingId(req._id);
                            setRejectionReason('Time changed');
                          }}
                          className="w-full rounded-xl border border-zinc-800 bg-white/5 py-3 text-xs font-bold uppercase tracking-widest text-zinc-300 transition-all hover:bg-white/10 active:scale-95 cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    )
                  ) : (
                    <div className={`text-center py-3 rounded-xl text-xs font-bold uppercase tracking-widest ${
                      req.status === 'confirmed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {req.status}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
