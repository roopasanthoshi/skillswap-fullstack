import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { Loader2, Search as SearchIcon, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from '../components/ui/Skeleton';

const Search = () => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const { ref, inView } = useInView({
    threshold: 0,
  });

  const fetchResults = useCallback(async (pageNum, reset = false) => {
    setIsFetching(true);
    try {
      const res = await api.get('/search', {
        params: { query, category, page: pageNum, limit: 8 }
      });
      
      const usersList = res.data.users || [];
      if (reset) {
        setResults(usersList);
      } else {
        setResults(prev => [...prev, ...usersList]);
      }
      
      setHasMore(res.data.currentPage < res.data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
      setInitialLoading(false);
    }
  }, [query, category]);

  useEffect(() => {
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      setInitialLoading(true);
      fetchResults(1, true);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, category, fetchResults]);

  useEffect(() => {
    if (inView && hasMore && !isFetching && !initialLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchResults(nextPage);
    }
  }, [inView, hasMore, isFetching, initialLoading, page, fetchResults]);

  const handleConnect = async (receiverId) => {
    setActionLoading(receiverId);
    try {
      await api.post('/requests', { receiverId });
      // Update UI state
      setResults(results.map(user => 
        user.id === receiverId ? { ...user, requestSent: true } : user
      ));
    } catch (err) {
      console.error('Failed to send request:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const categories = ['Programming', 'Design', 'Marketing', 'Business', 'Languages', 'Music'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <SearchIcon className="text-[#00f0ff] w-10 h-10" />
          Global Node Discovery
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Query the Nexus database to find experts and learners matching your specific parameters.
        </p>
      </div>

      <Card variant="glass" className="p-6 mb-12 sticky top-24 z-20">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, bio, or skills..."
              className="w-full bg-[#0d111a] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
            <Filter className="text-slate-400 w-5 h-5 mr-2 flex-shrink-0" />
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex-shrink-0 ${category === '' ? 'bg-[#00f0ff] text-black font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
            >
              All Segments
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors flex-shrink-0 ${category === cat ? 'bg-[#00f0ff] text-black font-bold' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {initialLoading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i} variant="glass" className="h-64 flex flex-col p-6">
              <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
              <Skeleton className="h-4 w-1/2 mx-auto mb-6" />
              <div className="flex gap-2 mt-auto">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </Card>
          ))
        ) : results.length === 0 ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <X className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">No matching nodes</h3>
            <p className="text-slate-500">Adjust your query parameters to continue discovery.</p>
          </div>
        ) : (
          results.map((user) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={user.id}
            >
              <Card variant="solid" className="h-full flex flex-col items-center text-center p-6 relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#00f0ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative mb-4 z-10">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00f0ff] to-[#b026ff] p-[2px]">
                    <div className="w-full h-full rounded-full bg-[#141822] flex items-center justify-center text-2xl font-bold overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] to-[#b026ff]">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`absolute bottom-0 right-0 w-4 h-4 border-[3px] border-[#141822] rounded-full ${user.status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-slate-500'}`} />
                </div>
                
                <h3 className="text-lg font-bold z-10">{user.name}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 mt-2 mb-4 z-10">
                  {user.bio || 'Node active in the Nexus network.'}
                </p>
                
                <div className="flex flex-wrap justify-center gap-1 mt-auto z-10">
                  {user.knownSkills.slice(0, 3).map(ks => (
                    <span key={ks.skill.id} className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-full text-slate-300">
                      {ks.skill.name}
                    </span>
                  ))}
                  {user.knownSkills.length > 3 && (
                    <span className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 rounded-full text-slate-400">
                      +{user.knownSkills.length - 3}
                    </span>
                  )}
                </div>

                <div className="w-full mt-6 z-10 pt-4 border-t border-white/5">
                  <Button 
                    variant={user.requestSent ? 'outline' : 'primary'} 
                    className="w-full text-sm py-2"
                    onClick={() => !user.requestSent && handleConnect(user.id)}
                    disabled={user.requestSent || actionLoading === user.id}
                  >
                    {actionLoading === user.id ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 
                     user.requestSent ? 'Request Sent' : 'Connect'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {isFetching && !initialLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-[#00f0ff] animate-spin" />
        </div>
      )}

      {/* Invisible element to trigger intersection observer */}
      <div ref={ref} className="h-10" />
    </div>
  );
};

export default Search;
