/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Heart, History, Settings, Search, Trash2, ArrowRight, ShieldCheck, HeartOff } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { NameCardType, HistoryRecord, SceneType } from '../types';
import { SCENE_OPTIONS, STYLE_OPTIONS } from '../data';

interface ManagerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: '收藏' | '历史' | '设置';
  setActiveTab: (tab: '收藏' | '历史' | '设置') => void;

  // 收藏相关
  collectedList: NameCardType[];
  onRemoveCollection: (id: string) => void;
  onClearCollections: () => void;
  onReuseConfig: (config: {
    scene: SceneType;
    surname: string;
    length: 2 | 3 | 4;
    styles: any[];
  }) => void;

  // 历史相关
  historyList: HistoryRecord[];
  onClearHistory: () => void;

  // 主题与提示
  onToast: (msg: string, type: 'success' | 'info') => void;
}

export function ManagerDrawer({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  collectedList,
  onRemoveCollection,
  onClearCollections,
  onReuseConfig,
  historyList,
  onClearHistory,
  onToast,
}: ManagerDrawerProps) {
  const [faveSearch, setFaveSearch] = useState('');

  // 过滤收藏
  const filteredCollected = collectedList.filter((item) => {
    const q = faveSearch.trim().toLowerCase();
    if (!q) return true;
    const fullName = (item.surname + item.name).toLowerCase();
    const meaning = item.meaning.toLowerCase();
    return fullName.includes(q) || meaning.includes(q);
  });

  const getSceneName = (sceneId: string) => {
    return SCENE_OPTIONS.find((s) => s.id === sceneId)?.name || '未知场景';
  };

  const handleReuse = (card: NameCardType) => {
    onReuseConfig({
      scene: card.scene,
      surname: card.surname,
      length: card.name.length as 2 | 3 | 4,
      styles: card.styles,
    });
    onToast(`已复用「${card.surname || ''}${card.name}」的设置，并重新生成！`, 'success');
    onClose();
  };

  const handleHistoryReuse = (record: HistoryRecord) => {
    onReuseConfig({
      scene: record.config.scene,
      surname: record.config.surname,
      length: record.config.length,
      styles: record.config.styles,
    });
    onToast(`已载入历史批量取名配置并生成新卡片！`, 'success');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:justify-end justify-center items-end md:items-stretch" id="drawer-manager-panel">
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity"
            id="drawer-backdrop"
          />

          {/* 侧边 / 底部内容区（自适应手机与PC） */}
          <motion.div
            initial={{ y: '100%', md: { y: 0, x: '100%' } }}
            animate={{ y: 0, x: 0 }}
            exit={{ y: '100%', md: { y: 0, x: '100%' } }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-t-none h-[88vh] md:h-full shadow-2xl flex flex-col z-10 border-t md:border-t-0 md:border-l border-neutral-100 overflow-hidden"
            id="drawer-body"
          >
            {/* 手机专属：优雅滑动把手手饰 (Drag indicator) */}
            <div className="md:hidden flex justify-center py-2.5 flex-shrink-0 cursor-grab" id="mobile-drag-bar">
              <span className="w-12 h-1 bg-neutral-200 rounded-full" />
            </div>

            {/* 头部装饰 */}
            <div className="flex items-center justify-between px-6 py-4 md:py-5 border-b border-neutral-100 flex-shrink-0" id="drawer-header">
              <div className="flex bg-neutral-100 p-0.5 rounded-xl text-xs" id="drawer-tab-triggers">
                <button
                  onClick={() => setActiveTab('收藏')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all cursor-pointer active:scale-95 ${
                    activeTab === '收藏'
                      ? 'bg-white text-neutral-800 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                  id="tab-btn-collected"
                >
                  <Heart className={`w-3.5 h-3.5 ${activeTab === '收藏' ? 'fill-rose-400 text-rose-400' : ''}`} />
                  收藏 ({collectedList.length})
                </button>
                <button
                  onClick={() => setActiveTab('历史')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all cursor-pointer active:scale-95 ${
                    activeTab === '历史'
                      ? 'bg-white text-neutral-800 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                  id="tab-btn-history"
                >
                  <History className="w-3.5 h-3.5" />
                  历史
                </button>
                <button
                  onClick={() => setActiveTab('设置')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all cursor-pointer active:scale-95 ${
                    activeTab === '设置'
                      ? 'bg-white text-neutral-800 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                  id="tab-btn-setting"
                >
                  <Settings className="w-3.5 h-3.5" />
                  系统
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 px-3 text-xs text-neutral-500 rounded-xl hover:bg-neutral-50 active:scale-95 transition-all border border-neutral-100 cursor-pointer"
                id="tab-close-drawer"
              >
                关闭
              </button>
            </div>

            {/* 核心面板区 */}
            <div className="flex-1 overflow-y-auto pb-8" id="drawer-panels-container">
              {/* ============ 收集卡片组 ============ */}
              {activeTab === '收藏' && (
                <div className="p-6 flex flex-col h-full" id="panel-collected">
                  {/* 搜索框 */}
                  <div className="relative mb-5 flex-shrink-0" id="收藏搜索框">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="搜索已收藏的名字或诗意注解..."
                      value={faveSearch}
                      onChange={(e) => setFaveSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-neutral-200 outline-none focus:border-[#6b8a9e] transition-colors bg-neutral-50/50"
                      id="fave-search-input"
                    />
                  </div>

                  {filteredCollected.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center" id="empty-faves">
                      <div className="w-14 h-14 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
                        <Heart className="w-6 h-6 text-neutral-300" />
                      </div>
                      <h4 className="text-xs font-semibold text-neutral-700">暂无吻合的主轴</h4>
                      <p className="text-[10px] text-neutral-400 max-w-[200px] mt-1 leading-normal">
                        收藏喜欢的名字后，即可在这里快捷搜罗或复位它的场景参数。
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 overflow-y-auto flex-1 select-none" id="fave-cards-list">
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1 flex-shrink-0">
                        <span>过滤所得 {filteredCollected.length} 件</span>
                        <button
                          onClick={onClearCollections}
                          className="text-red-500 hover:text-red-600 transition-colors cursor-pointer font-medium"
                          id="clear-all-faves"
                        >
                          清空全部收藏
                        </button>
                      </div>

                      {filteredCollected.map((item) => (
                        <div
                          key={item.id}
                          className="border border-[#e5e5e5] rounded-2xl p-4 bg-white hover:border-neutral-300 transition-colors flex flex-col justify-between"
                          id={`fave-item-${item.id}`}
                        >
                          <div>
                            {/* 名字大字 */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-end gap-0.5">
                                {item.surname && (
                                  <span className="text-sm text-neutral-400 mb-0.5">{item.surname}</span>
                                )}
                                <span className="text-lg font-bold text-neutral-800">{item.name}</span>
                              </div>
                              <span className="text-[9px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                                {getSceneName(item.scene)}
                              </span>
                            </div>
                            {/* 诗意 */}
                            <p className="text-[11px] text-neutral-500 leading-relaxed font-sans line-clamp-2">
                              {item.meaning}
                            </p>
                          </div>

                          {/* 卡片动作 */}
                          <div className="mt-4 pt-3 border-t border-dashed border-neutral-100 flex items-center justify-between text-[11px]">
                            <button
                              onClick={() => onRemoveCollection(item.id)}
                              className="text-neutral-400 hover:text-red-500 transition-colors cursor-pointer flex items-center gap-1 py-1 px-2 hover:bg-neutral-50 rounded-lg"
                              id={`delete-fave-item-${item.id}`}
                            >
                              <HeartOff className="w-3.5 h-3.5" />
                              <span>移除</span>
                            </button>

                            <button
                              onClick={() => handleReuse(item)}
                              className="text-[#6b8a9e] hover:text-[#5c7c8c] font-semibold transition-colors cursor-pointer flex items-center gap-1 py-1 px-2 hover:bg-[#6b8a9e]/5 rounded-lg"
                              id={`reuse-fave-item-${item.id}`}
                            >
                              <span>复用此配置</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ============ 历史生成板块 ============ */}
              {activeTab === '历史' && (
                <div className="p-6 flex flex-col h-full" id="panel-history">
                  {historyList.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center" id="empty-history">
                      <div className="w-14 h-14 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
                        <History className="w-6 h-6 text-neutral-300" />
                      </div>
                      <h4 className="text-xs font-semibold text-neutral-700">历史一尘不染</h4>
                      <p className="text-[10px] text-neutral-400 max-w-[200px] mt-1 leading-normal">
                        您一键生成名字卡片的经历会被自动保留最近 10 次，快去首页试飞一次吧。
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4 overflow-y-auto flex-1 select-none pr-1" id="history-batches-list">
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1 flex-shrink-0">
                        <span>仅留最近 {historyList.length} 轮生成纪实</span>
                        <button
                          onClick={onClearHistory}
                          className="text-red-500 hover:text-red-600 transition-colors cursor-pointer font-medium"
                          id="clear-all-history"
                        >
                          清空全部历史
                        </button>
                      </div>

                      {historyList.map((rec) => {
                        const formattedTime = new Date(rec.timestamp).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        return (
                          <div
                            key={rec.id}
                            className="border border-[#e5e5e5] bg-neutral-50/50 rounded-2xl p-4 hover:border-neutral-300 transition-all flex flex-col gap-3"
                            id={`history-item-${rec.id}`}
                          >
                            {/* 历史头部 */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-neutral-400 font-mono">{formattedTime} 运行</span>
                              <span className="text-[10px] font-semibold text-[#6b8a9e]">
                                {getSceneName(rec.config.scene)} · {rec.config.length}字
                              </span>
                            </div>

                            {/* 名字串串 */}
                            <div className="flex flex-wrap gap-1.5">
                              {rec.generatedCards.map((g, gi) => (
                                <span
                                  key={gi}
                                  className="bg-white px-2.5 py-1 rounded-xl border border-neutral-150 text-[11px] font-bold text-neutral-800 shadow-3xs"
                                >
                                  {g.surname ? `${g.surname}${g.name}` : g.name}
                                </span>
                              ))}
                            </div>

                            {/* 复用 */}
                            <div className="pt-2.5 border-t border-neutral-100 flex justify-end">
                              <button
                                onClick={() => handleHistoryReuse(rec)}
                                className="text-xs text-neutral-600 hover:text-neutral-950 border border-neutral-200 bg-white px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 font-bold active:scale-95"
                                id={`reuse-history-btn-${rec.id}`}
                              >
                                <span>载入本批配置</span>
                               <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ============ 系统设置与关于 ============ */}
              {activeTab === '设置' && (
                <div className="p-6 space-y-6 text-xs text-neutral-600 leading-relaxed font-sans" id="panel-settings">
                  {/* 关于我们部分 */}
                  <div className="space-y-3" id="setting-about-group">
                    <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">关于“云序择名”</h4>
                    <p className="font-extrabold text-neutral-800">
                      云生雅序，择优为名。
                    </p>
                    <p>
                      「云序择名」是一款极简主义、纯国风色系的名字择选工具，每个推荐方案均深度考量了古典汉语言文学的语流连贯性、反切平仄标音，结合高纯度自然色背景美学模板，为您实现舒适、沉浸的雅致观感！
                    </p>
                    <p className="text-amber-600 font-medium font-sans">
                      温馨提示：所有生成的名字仅供参考，请拒绝任何封建迷信！
                    </p>
                  </div>

                  {/* 操作中心 */}
                  <div className="pt-4 border-t border-neutral-100" id="setting-actions-group">
                    <h4 className="font-bold text-neutral-800 uppercase tracking-wider mb-2">数据管理</h4>

                    <div className="flex items-center justify-between gap-4 p-4 bg-red-50/50 rounded-2xl border border-red-100">
                      <div>
                        <h5 className="font-semibold text-red-800 text-[10.5px]">抹去本地纪实数据</h5>
                        <p className="text-[9.5px] text-red-500 mt-0.5">清空历史记录（不影响您的收藏库）</p>
                      </div>
                      <button
                        onClick={() => {
                          onClearHistory();
                          onToast('历史足迹已清空。', 'success');
                        }}
                        className="px-3 py-2 bg-white border border-red-200 text-red-650 hover:bg-red-50 active:scale-95 transition-all text-[10px] font-bold rounded-xl cursor-pointer"
                        id="clear-history-settings-btn"
                      >
                        抹去历史
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
