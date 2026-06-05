import { Command } from 'cmdk';
import dayjs from 'dayjs';
import { MessageSquare, Search } from 'lucide-react';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { SESSION_CHAT_TOPIC_URL } from '@/const/url';
import { type SearchResult } from '@/database/repositories/search';
import { type ValidSearchType } from './utils/queryParser';

interface SearchResultsProps {
  isLoading: boolean;
  onClose: () => void;
  onSetTypeFilter: (typeFilter: ValidSearchType | undefined) => void;
  results: SearchResult[];
  searchQuery: string;
  typeFilter: ValidSearchType | undefined;
}

const fmt = (d: Date | string) => dayjs(d).format('D MMMM YYYY');

// ── CHANGE THIS NUMBER TO SWITCH OPTION ──
const ACTIVE_OPTION = 5;

const SearchResults = memo<SearchResultsProps>(({ isLoading, onClose, results, searchQuery }) => {
  const navigate = useNavigate();

  const handleNavigate = (result: SearchResult) => {
    if (result.type === 'topic') {
      result.agentId
        ? navigate(SESSION_CHAT_TOPIC_URL(result.agentId, result.id))
        : navigate(`/chat?topic=${result.id}`);
    } else if (result.type === 'message') {
      result.topicId && result.agentId
        ? navigate(`${SESSION_CHAT_TOPIC_URL(result.agentId, result.topicId)}#${result.id}`)
        : navigate(`/chat#${result.id}`);
    }
    onClose();
  };

  const convResults = results.filter((r) => r.type === 'topic' || r.type === 'message');

  if (!isLoading && convResults.length === 0 && searchQuery) {
    return (
      <Command.Empty>
        <div style={{ color: 'rgba(0,0,0,0.3)', fontSize: 13, padding: '40px 20px', textAlign: 'center' }}>
          No conversations found for "<strong style={{ color: '#111' }}>{searchQuery}</strong>"
        </div>
      </Command.Empty>
    );
  }

  if (!isLoading && convResults.length === 0) return null;

  // ── OPTION 1: Clean minimal rows with date on right ──
  const Option1 = () => (
    <Command.Group>
      {convResults.map((r) => (
        <Command.Item forceMount key={r.id} value={`search-result ${r.type} ${r.id} ${r.title}`} onSelect={() => handleNavigate(r)}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 12, padding: '10px 16px', width: '100%' }}>
            <MessageSquare size={15} style={{ color: 'rgba(0,0,0,0.35)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#111', fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title || 'Untitled'}</div>
              {r.description && <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: 12, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</div>}
            </div>
            <div style={{ color: 'rgba(0,0,0,0.28)', flexShrink: 0, fontSize: 11 }}>{r.createdAt ? fmt(r.createdAt) : ''}</div>
          </div>
        </Command.Item>
      ))}
    </Command.Group>
  );

  // ── OPTION 2: Card style with subtle background ──
  const Option2 = () => (
    <Command.Group>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 12px' }}>
        {convResults.map((r) => (
          <Command.Item forceMount key={r.id} value={`search-result ${r.type} ${r.id} ${r.title}`} onSelect={() => handleNavigate(r)} style={{ borderRadius: 10 }}>
            <div style={{ alignItems: 'flex-start', background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: 10, display: 'flex', gap: 12, padding: '10px 14px', width: '100%' }}>
              <div style={{ alignItems: 'center', background: '#f0f0f0', borderRadius: 8, display: 'flex', flexShrink: 0, height: 34, justifyContent: 'center', width: 34 }}>
                <MessageSquare size={15} style={{ color: '#666' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#111', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title || 'Untitled'}</div>
                {r.description && <div style={{ color: 'rgba(0,0,0,0.45)', fontSize: 12, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</div>}
                <div style={{ color: 'rgba(0,0,0,0.3)', fontSize: 11, marginTop: 4 }}>{r.createdAt ? fmt(r.createdAt) : ''}</div>
              </div>
            </div>
          </Command.Item>
        ))}
      </div>
    </Command.Group>
  );

  // ── OPTION 3: Two-line compact with left accent ──
  const Option3 = () => (
    <Command.Group>
      {convResults.map((r) => (
        <Command.Item forceMount key={r.id} value={`search-result ${r.type} ${r.id} ${r.title}`} onSelect={() => handleNavigate(r)}>
          <div style={{ alignItems: 'stretch', display: 'flex', gap: 0, padding: '0 16px', width: '100%' }}>
            <div style={{ background: '#111', borderRadius: 2, flexShrink: 0, marginBlock: 10, marginRight: 12, width: 3 }} />
            <div style={{ flex: 1, minWidth: 0, paddingBlock: 10 }}>
              <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: '#111', fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title || 'Untitled'}</div>
                <div style={{ color: 'rgba(0,0,0,0.28)', flexShrink: 0, fontSize: 11, marginLeft: 12 }}>{r.createdAt ? fmt(r.createdAt) : ''}</div>
              </div>
              {r.description && <div style={{ color: 'rgba(0,0,0,0.4)', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</div>}
            </div>
          </div>
        </Command.Item>
      ))}
    </Command.Group>
  );

  // ── OPTION 4: Spotlight style - large title, date below ──
  const Option4 = () => (
    <Command.Group heading={<span style={{ color: 'rgba(0,0,0,0.35)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', padding: '0 16px', textTransform: 'uppercase' }}>Conversations</span>}>
      {convResults.map((r) => (
        <Command.Item forceMount key={r.id} value={`search-result ${r.type} ${r.id} ${r.title}`} onSelect={() => handleNavigate(r)}>
          <div style={{ alignItems: 'center', display: 'flex', gap: 14, padding: '12px 16px', width: '100%' }}>
            <div style={{ alignItems: 'center', background: 'linear-gradient(135deg, #f5f5f5, #ebebeb)', borderRadius: 10, display: 'flex', flexShrink: 0, height: 38, justifyContent: 'center', width: 38 }}>
              <MessageSquare size={16} style={{ color: '#555' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#111', fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title || 'Untitled'}</div>
              <div style={{ color: 'rgba(0,0,0,0.35)', fontSize: 12, marginTop: 2 }}>{r.createdAt ? fmt(r.createdAt) : ''}</div>
            </div>
            <div style={{ color: 'rgba(0,0,0,0.2)', flexShrink: 0, fontSize: 20 }}>›</div>
          </div>
        </Command.Item>
      ))}
    </Command.Group>
  );

  // ── OPTION 5: Timeline style grouped by date ──
  const grouped = convResults.reduce((acc: Record<string, SearchResult[]>, r) => {
    const key = r.createdAt ? fmt(r.createdAt) : 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const Option5 = () => (
    <>
      {Object.entries(grouped).map(([date, items]) => (
        <Command.Group key={date} heading={<span style={{ color: 'rgba(0,0,0,0.35)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', padding: '0 16px', textTransform: 'uppercase' }}>{date}</span>}>
          {items.map((r) => (
            <Command.Item forceMount key={r.id} value={`search-result ${r.type} ${r.id} ${r.title}`} onSelect={() => handleNavigate(r)}>
              <div style={{ alignItems: 'center', display: 'flex', gap: 10, padding: '8px 16px 8px 28px', width: '100%' }}>
                <MessageSquare size={14} style={{ color: 'rgba(0,0,0,0.3)', flexShrink: 0 }} />
                <div style={{ color: '#111', flex: 1, fontSize: 14, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title || 'Untitled'}</div>
              </div>
            </Command.Item>
          ))}
        </Command.Group>
      ))}
    </>
  );

  const options: Record<number, JSX.Element> = { 1: <Option1 />, 2: <Option2 />, 3: <Option3 />, 4: <Option4 />, 5: <Option5 /> };

  return (
    <>
      {options[ACTIVE_OPTION]}
      {isLoading && (
        <Command.Group>
          {[1, 2, 3].map((i) => (
            <Command.Item disabled key={`sk-${i}`} value={`loading-${i}`}>
              <div style={{ alignItems: 'center', display: 'flex', gap: 12, padding: '10px 16px', width: '100%' }}>
                <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: 6, flexShrink: 0, height: 28, width: 28 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ background: 'rgba(0,0,0,0.06)', borderRadius: 4, height: 13, marginBottom: 5, width: `${50 + i * 15}%` }} />
                  <div style={{ background: 'rgba(0,0,0,0.04)', borderRadius: 4, height: 11, width: `${30 + i * 10}%` }} />
                </div>
              </div>
            </Command.Item>
          ))}
        </Command.Group>
      )}
    </>
  );
});

SearchResults.displayName = 'SearchResults';
export default SearchResults;
