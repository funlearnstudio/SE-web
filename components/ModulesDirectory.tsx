'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useLanguage } from './LanguageProvider';
import { groupInfo, modules } from '@/lib/modules';

export function ModulesDirectory() {
  const { language } = useLanguage();
  const zh = language === 'zh';
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const groups = Object.keys(groupInfo);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return modules.filter((module) => {
      const matchesGroup = group === 'all' || module.group === group;
      const matchesQuery = !q || module.name.includes(q) || module.description.en.toLowerCase().includes(q) || module.description.zh.includes(query.trim());
      return matchesGroup && matchesQuery;
    });
  }, [query, group]);

  return (
    <>
      <div className="module-controls">
        <input
          className="search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={zh ? '搜尋 module 或用途…' : 'Search modules or capabilities…'}
          aria-label="Search modules"
        />
        <select className="filter-select" value={group} onChange={(event) => setGroup(event.target.value)}>
          <option value="all">{zh ? '全部分類' : 'All categories'}</option>
          {groups.map((key) => <option key={key} value={key}>{groupInfo[key][language]}</option>)}
        </select>
      </div>
      <div className="module-grid">
        {filtered.map((module) => (
          <Link href={`/modules/${module.name}`} className="module-card" key={module.name}>
            <div className="module-card-top">
              <code>{module.name}</code>
              <span className="badge">{groupInfo[module.group][language]}</span>
            </div>
            <p>{module.description[language]}</p>
            <div className="module-meta"><span>{module.members.length} API</span><span>·</span><span>use {module.name}</span></div>
          </Link>
        ))}
      </div>
      {filtered.length === 0 ? <div className="notice">{zh ? '找不到符合條件的 module。' : 'No modules match your search.'}</div> : null}
    </>
  );
}
