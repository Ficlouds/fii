import { Command } from 'cmdk';
import { Search, X } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useAgentStore } from '@/store/agent';
import { agentSelectors } from '@/store/agent/selectors';

import { useCommandMenuContext } from '../CommandMenuContext';
import { styles } from '../styles';
import { useCommandMenu } from '../useCommandMenu';
import { type ValidSearchType } from '../utils/queryParser';

const CommandInput = memo(() => {
  const { t } = useTranslation('common');

  const { handleBack } = useCommandMenu();
  const {
    menuContext,
    pages,
    page,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    selectedAgent,
    setSelectedAgent,
    activeAgentId,
  } = useCommandMenuContext();

  const activeAgentMeta = useAgentStore((s) =>
    activeAgentId ? agentSelectors.getAgentMetaById(activeAgentId)(s) : undefined,
  );

  const hasPages = pages.length > 0;
  const hasSelectedAgent = !!selectedAgent;
  const hasActiveAgent = !!activeAgentId && menuContext === 'agent';

  // Get localized context name
  const contextName = t(`cmdk.context.${menuContext}`, { defaultValue: menuContext });

  const getTypeLabel = (type: ValidSearchType) => {
    return t(`cmdk.search.${type}`);
  };

  const getPlaceholder = () => {
    if (hasSelectedAgent) {
      return t('cmdk.askAgentPlaceholder', { agent: selectedAgent.title });
    }
    if (page === 'ask-ai') {
      return t('cmdk.aiModePlaceholder');
    }
    return t('cmdk.searchPlaceholder');
  };

  return (
    <div style={{ alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.07)', display: 'flex', gap: 12, padding: '18px 20px' }}>
      <Search size={20} style={{ color: 'rgba(0,0,0,0.35)', flexShrink: 0 }} />
      <Command.Input
        autoFocus
        maxLength={500}
        placeholder="Search conversations..."
        value={search}
        onValueChange={setSearch}
        style={{ background: 'transparent', border: 'none', color: '#111', flex: 1, fontSize: 17, fontWeight: 400, minWidth: 0, outline: 'none' }}
      />
      {search && (
        <button
          onClick={() => setSearch('')}
          style={{ alignItems: 'center', background: 'rgba(0,0,0,0.07)', border: 'none', borderRadius: '50%', color: 'rgba(0,0,0,0.4)', cursor: 'pointer', display: 'flex', flexShrink: 0, height: 20, justifyContent: 'center', width: 20 }}
        >
          <X size={12} />
        </button>
      )}
      <kbd style={{ background: 'rgba(0,0,0,0.06)', borderRadius: 6, color: 'rgba(0,0,0,0.35)', fontSize: 11, fontWeight: 500, padding: '3px 7px' }}>ESC</kbd>
    </div>
  );
});

CommandInput.displayName = 'CommandInput';

export default CommandInput;
