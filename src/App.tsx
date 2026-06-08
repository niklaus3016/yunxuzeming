/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  SlidersHorizontal, 
  Bookmark, 
  History, 
  Settings, 
  RotateCw,
  Plus,
  Compass,
  ArrowRight,
  Heart,
  User,
  Info,
  Search,
  HeartOff,
  Image as ImageIcon,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SceneType, StyleType, NameCardType, HistoryRecord } from './types';
import { SCENE_OPTIONS, STYLE_OPTIONS, generateNames } from './data';
import { NameCard } from './components/NameCard';
import { PosterModal } from './components/PosterModal';
import { ToastContainer, ToastItem } from './components/Toast';
import { PrivacyModal, AgreementModal, DeclineConfirmModal, PrivacyPolicyContent, UserAgreementContent } from './components/PrivacyModal';

export default function App() {
  // --- 核心用户输入状态 ---
  const [scene, setScene] = useState<SceneType>('baby_boy');
  const [surname, setSurname] = useState('');
  const [length, setLength] = useState<2 | 3 | 4 | undefined>(undefined);
  const [selectedStyles, setSelectedStyles] = useState<StyleType[]>([]);

  // --- 导航与过滤状态 ---
  const [activeTab, setActiveTab] = useState<'起名' | '收藏' | '历史' | '设置'>('起名');
  const [faveSearch, setFaveSearch] = useState('');

  // --- 高级筛选状态 ---
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [includeChars, setIncludeChars] = useState('');
  const [excludeChars, setExcludeChars] = useState('');

  // --- 运行与输出状态 ---
  const [cards, setCards] = useState<NameCardType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // --- 海报状态 ---
  const [activePosterCard, setActivePosterCard] = useState<NameCardType | null>(null);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // --- 隐私政策弹窗状态 ---
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [showPrivacyDetailModal, setShowPrivacyDetailModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // --- 收藏 & 历史本地存储 ---
  const [collected, setCollected] = useState<NameCardType[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // --- 全局Toast提示 ---
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // 滚动展示定位锚点
  const resultsRef = useRef<HTMLDivElement>(null);

  // --- localStorage 安全操作辅助 ---
  const safeGetItem = (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      console.error(`Failed to get ${key} from localStorage`);
      return null;
    }
  };

  const safeSetItem = (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.error(`Failed to set ${key} in localStorage`, err);
    }
  };

  // --- 初始化加载数据 (LocalStorage) ---
  useEffect(() => {
    // 1. 检查隐私政策是否已同意
    const accepted = localStorage.getItem('yunxu_privacy_accepted');
    if (!accepted) {
      setShowPrivacyModal(true);
      return;
    }
    setPrivacyAccepted(true);

    // 2. 记忆上次姓氏
    const savedSurname = localStorage.getItem('yunxu_surname');
    if (savedSurname) setSurname(savedSurname);

    // 3. 收藏
    const savedCollected = localStorage.getItem('yunxu_collected');
    if (savedCollected) {
      try {
        const parsed = JSON.parse(savedCollected);
        // 确保每条记录都有有效id
        const validCollected = parsed.map((item: any, index: number) => ({
          ...item,
          id: item.id || `col-fallback-${Date.now()}-${index}`
        }));
        setCollected(validCollected);
      } catch (err) {
        console.error('Failed to parse collected', err);
      }
    }

    // 4. 历史
    const savedHistory = localStorage.getItem('yunxu_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // 确保每条记录都有有效id
        const validHistory = parsed.map((item: any, index: number) => ({
          ...item,
          id: item.id || `hist-fallback-${Date.now()}-${index}`
        }));
        setHistory(validHistory);
      } catch (err) {
        console.error('Failed to parse history', err);
      }
    }

    // 5. 初次启动：配置字数与风格，预先铺设 10 张雅致名字卡
    const defaultLength = 2;
    const defaultStyles: StyleType[] = ['warm_elegant'];
    setLength(defaultLength);
    setSelectedStyles(defaultStyles);

    const initialCards = generateNames({
      scene: 'baby_boy',
      surname: savedSurname || '陆',
      length: defaultLength,
      styles: defaultStyles,
      includeChars: '',
      excludeChars: '',
    });
    setCards(initialCards);
  }, []);

  // --- 监测状态变化，触发姓氏存储 ---
  const handleSurnameChange = (val: string) => {
    const filteredVal = val.replace(/[^\u4e00-\u9fa5]/g, '').slice(0, 3);
    setSurname(filteredVal);
    safeSetItem('yunxu_surname', filteredVal);
  };

  // --- 风格标签点击（多选） ---
  const toggleStyle = (styleId: StyleType) => {
    if (selectedStyles.includes(styleId)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== styleId));
    } else {
      setSelectedStyles([...selectedStyles, styleId]);
    }
  };

  // --- Toast 弹窗辅助 ---
  const addToast = (message: string, type: 'success' | 'info' = 'success') => {
    const newToast: ToastItem = {
      id: `${Date.now()}-${Math.random()}`,
      message,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- 隐私政策弹窗处理 ---
  const handlePrivacyAccept = () => {
    localStorage.setItem('yunxu_privacy_accepted', 'true');
    setPrivacyAccepted(true);
    setShowPrivacyModal(false);
    
    // 同意后初始化数据
    const savedSurname = localStorage.getItem('yunxu_surname');
    const defaultLength = 2;
    const defaultStyles: StyleType[] = ['warm_elegant'];
    setLength(defaultLength);
    setSelectedStyles(defaultStyles);

    const initialCards = generateNames({
      scene: 'baby_boy',
      surname: savedSurname || '陆',
      length: defaultLength,
      styles: defaultStyles,
      includeChars: '',
      excludeChars: '',
    });
    setCards(initialCards);

    const savedCollected = localStorage.getItem('yunxu_collected');
    if (savedCollected) {
      try {
        const parsed = JSON.parse(savedCollected);
        const validCollected = parsed.map((item: any, index: number) => ({
          ...item,
          id: item.id || `col-fallback-${Date.now()}-${index}`
        }));
        setCollected(validCollected);
      } catch (err) {
        console.error('Failed to parse collected', err);
      }
    }

    const savedHistory = localStorage.getItem('yunxu_history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const validHistory = parsed.map((item: any, index: number) => ({
          ...item,
          id: item.id || `hist-fallback-${Date.now()}-${index}`
        }));
        setHistory(validHistory);
      } catch (err) {
        console.error('Failed to parse history', err);
      }
    }
  };

  const handlePrivacyDecline = () => {
    setShowDeclineModal(true);
  };

  const handleDeclineConfirm = () => {
    setShowDeclineModal(false);
    setShowPrivacyModal(false);
  };

  const handleDeclineCancel = () => {
    setShowDeclineModal(false);
  };

  const handleOpenAgreement = () => {
    setShowAgreementModal(true);
  };

  const handleOpenPrivacy = () => {
    setShowPrivacyDetailModal(true);
  };

  // --- 一键生成引擎核心调用 ---
  const handleGenerate = () => {
    if (!length) {
      addToast('请先选择名字字数（2字/3字/4字）。', 'info');
      return;
    }
    if (selectedStyles.length === 0) {
      addToast('请至少选择一个名字风格。', 'info');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      try {
        const generated = generateNames({
          scene,
          surname,
          length,
          styles: selectedStyles,
          includeChars,
          excludeChars,
        });

        if (generated.length === 0) {
          addToast('未找到完全契合的过滤汉字，已放宽条件生成相似推荐。', 'info');
          const relaxation = generateNames({
            scene,
            surname,
            length,
            styles: selectedStyles,
            includeChars: '',
            excludeChars: '',
          });
          setCards(relaxation);
        } else {
          setCards(generated);
          addToast('为您智选了 10 枚新雅名字卡片。', 'success');

          // 保存至历史记录
          const newRecord: HistoryRecord = {
            id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: Date.now(),
            config: {
              scene,
              surname,
              length,
              styles: selectedStyles,
              includeChars,
              excludeChars,
            },
            generatedCards: generated,
          };

          const updatedHistory = [newRecord, ...history].slice(0, 10);
          setHistory(updatedHistory);
          safeSetItem('yunxu_history', JSON.stringify(updatedHistory));
        }

        // 手机/移动端体验优化：一键平滑滚动定位到结果大屏区
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);

      } catch (err) {
        console.error(err);
        addToast('生成遇到了阻碍，请重试。', 'info');
      } finally {
        setIsGenerating(false);
      }
    }, 450);
  };

  // --- 收藏切换动作 ---
  const handleToggleCollect = (card: NameCardType) => {
    const exists = collected.some((c) => c.name === card.name && c.surname === card.surname && c.scene === card.scene);
    let updated;
    if (exists) {
      updated = collected.filter((c) => !(c.name === card.name && c.surname === card.surname && c.scene === card.scene));
      addToast(`已取消收藏「${card.surname || ''}${card.name}」`, 'info');
    } else {
      updated = [{ ...card, id: `coll-${Date.now()}-${Math.floor(Math.random() * 1000)}` }, ...collected];
      addToast(`「${card.surname || ''}${card.name}」已收入我的收藏。`, 'success');
    }
    setCollected(updated);
    safeSetItem('yunxu_collected', JSON.stringify(updated));
  };

  // --- 单条删除收藏 (直接在页面内调用) ---
  const handleRemoveCollection = (id: string) => {
    const updated = collected.filter((c) => c.id !== id);
    setCollected(updated);
    safeSetItem('yunxu_collected', JSON.stringify(updated));
    addToast('已移除对应的名字收藏。', 'info');
  };

  // --- 清空全部收藏 ---
  const handleClearCollections = () => {
    if (window.confirm('确定要清空您精心选出的所有收藏吗？此操作无法撤销。')) {
      setCollected([]);
      safeSetItem('yunxu_collected', JSON.stringify([]));
      addToast('我的收藏已清空。', 'info');
    }
  };

  // --- 清空全部历史 ---
  const handleClearHistory = () => {
    if (window.confirm('确定要清空所有的起名轨迹记录吗？')) {
      setHistory([]);
      safeSetItem('yunxu_history', JSON.stringify([]));
      addToast('所有起名轨迹已清空。', 'success');
    }
  };

  // --- 复制卡片名字与释义 ---
  const handleCopyToClipboard = (card: NameCardType) => {
    const textToCopy = `「${card.surname || ''}${card.name}」
风格属性：${STYLE_OPTIONS.filter((so) => card.styles.includes(so.id)).map((s) => s.name).join(' · ')}
气韵释义：${card.meaning}
典籍原句：${card.source || '意境原创'}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      addToast(`「${card.surname || ''}${card.name}」释义剪贴成功！`, 'success');
    });
  };

  // --- 重用/复现收集的参数并一键重新选名并切入智能起名 ---
  const handleReuseAndRegen = (config: {
    scene: SceneType;
    surname: string;
    length: 2 | 3 | 4;
    styles: StyleType[];
    includeChars?: string;
    excludeChars?: string;
  }) => {
    setScene(config.scene);
    setSurname(config.surname);
    safeSetItem('yunxu_surname', config.surname);
    setLength(config.length);
    setSelectedStyles(config.styles);
    setIncludeChars(config.includeChars || '');
    setExcludeChars(config.excludeChars || '');
    setActiveTab('起名');

    setTimeout(() => {
      const regenerated = generateNames({
        scene: config.scene,
        surname: config.surname,
        length: config.length,
        styles: config.styles,
        includeChars: config.includeChars || '',
        excludeChars: config.excludeChars || '',
      });
      setCards(regenerated);

      // 备份历史
      const newRecord: HistoryRecord = {
        id: `hist-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
        config: {
          scene: config.scene,
          surname: config.surname,
          length: config.length,
          styles: config.styles,
          includeChars: config.includeChars || '',
          excludeChars: config.excludeChars || '',
        },
        generatedCards: regenerated,
      };
      const updatedHistory = [newRecord, ...history].slice(0, 10);
      setHistory(updatedHistory);
      safeSetItem('yunxu_history', JSON.stringify(updatedHistory));

      // 平滑滚动聚焦
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 100);
  };

  // --- 收藏状态Set化，O(1) 查询优化 ---
  const collectedSet = useMemo(() => {
    return new Set(collected.map((c) => `${c.name}-${c.surname}-${c.scene}`));
  }, [collected]);

  // --- 判断卡片是否已经收藏 ---
  const isCardCollected = (card: NameCardType) => {
    return collectedSet.has(`${card.name}-${card.surname}-${card.scene}`);
  };

  const canGenerate = length !== undefined && selectedStyles.length > 0;

  // 根据选中的Tab适应头部Title及英文副头
  const headerTitle = useMemo(() => {
    switch (activeTab) {
      case '起名':
        return { main: '云序择名', sub: 'Y U N  X U' };
      case '收藏':
        return { main: '我的收藏', sub: 'F A V O R I T E S' };
      case '历史':
        return { main: '生成历史', sub: 'H I S T O R Y' };
      case '设置':
        return { main: '系统设置', sub: 'S E T T I N G S' };
      default:
        return { main: '云序择名', sub: 'Y U N  X U' };
    }
  }, [activeTab]);

  const getSceneName = useMemo(() => (sceneId: string) => {
    return SCENE_OPTIONS.find((s) => s.id === sceneId)?.name || '未知场景';
  }, []);

  // 过滤收藏
  const filteredCollected = useMemo(() => {
    const q = faveSearch.trim().toLowerCase();
    if (!q) return collected;
    return collected.filter((item) => {
      const fullName = (item.surname + item.name).toLowerCase();
      const meaning = item.meaning.toLowerCase();
      const source = (item.source || '').toLowerCase();
      return fullName.includes(q) || meaning.includes(q) || source.includes(q);
    });
  }, [collected, faveSearch]);

  return (
    <div className="min-h-screen bg-[#fafaf7] text-neutral-800 flex flex-col justify-between selection:bg-[#6b8a9e]/20 selection:text-neutral-900 pb-24 md:pb-6" id="app-root-container">
      {/* 极简清亮安卓风格头部 */}
      <header className="border-b border-neutral-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-3xs" id="header-nav">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between" id="header-inner">
          {/* Logo 侧 */}
          <div className="flex items-center gap-2.5 select-none animate-fade-in" id="brand-logo-area">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6b8a9e] to-[#8fa385] flex items-center justify-center shadow-xs" id="brand-logo-icon">
              {activeTab === '起名' && <Compass className="w-5 h-5 text-white animate-spin" style={{ animationDuration: '40s' }} />}
              {activeTab === '收藏' && <Heart className="w-5 h-5 text-white fill-white" />}
              {activeTab === '历史' && <History className="w-5 h-5 text-white" />}
              {activeTab === '设置' && <Settings className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h1 className="text-sm font-black tracking-widest text-neutral-900 flex items-center gap-1" id="brand-title">
                {headerTitle.main}
              </h1>
              <p className="text-[8.5px] tracking-[1.5px] text-neutral-400 font-extrabold uppercase -mt-0.5" id="brand-sub">
                {headerTitle.sub}
              </p>
            </div>
          </div>

          {/* 电脑/大屏专属头部选项卡导航 (Responsive Desktop Tab Switcher) */}
          <div className="hidden md:flex bg-neutral-100 p-0.5 rounded-xl text-xs font-bold" id="desktop-nav-tabs">
            <button
              onClick={() => setActiveTab('起名')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer active:scale-95 ${
                activeTab === '起名'
                  ? 'bg-white text-neutral-800 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              id="desktop-tab-btn-generate"
            >
              <Compass className="w-3.5 h-3.5 text-[#6b8a9e]" />
              智能起名
            </button>
            <button
              onClick={() => setActiveTab('收藏')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer active:scale-95 ${
                activeTab === '收藏'
                  ? 'bg-white text-neutral-800 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              id="desktop-tab-btn-collected"
            >
              <Heart className={`w-3.5 h-3.5 ${activeTab === '收藏' ? 'fill-rose-400 text-rose-400' : ''}`} />
              我的收藏 ({collected.length})
            </button>
            <button
              onClick={() => setActiveTab('历史')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer active:scale-95 ${
                activeTab === '历史'
                  ? 'bg-white text-neutral-800 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              id="desktop-tab-btn-history"
            >
              <History className="w-3.5 h-3.5 text-[#8fa385]" />
              生成历史
            </button>
            <button
              onClick={() => setActiveTab('设置')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer active:scale-95 ${
                activeTab === '设置'
                  ? 'bg-white text-neutral-800 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              id="desktop-tab-btn-setting"
            >
              <Settings className="w-3.5 h-3.5 text-neutral-500" />
              系统设置
            </button>
          </div>
        </div>
      </header>

      {/* 主体核心区 */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pt-5 pb-36 md:pt-8 md:pb-16 flex flex-col justify-start" id="main-content">
        
        {/* 未同意隐私政策时的提示页面 */}
        {!privacyAccepted && !showPrivacyModal && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4" id="privacy-rejected-view">
            <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-12 h-12 text-neutral-400" />
            </div>
            <h2 className="text-xl font-black text-neutral-800 mb-3">隐私政策未同意</h2>
            <p className="text-sm text-neutral-500 mb-6 max-w-sm">
              为了保护您的隐私安全，需要您同意我们的用户协议与隐私政策才能使用本应用。
            </p>
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="px-8 py-3 bg-[#6b8a9e] hover:bg-[#5c7c8c] text-white font-bold rounded-xl transition-all active:scale-95"
              id="retry-privacy-btn"
            >
              重新阅读并同意
            </button>
          </div>
        )}

        {/* 只有同意隐私政策后才显示主界面 */}
        {privacyAccepted && (
          <AnimatePresence mode="wait">
            
          
          {/* ============ TABS 01: 智能起名板块 ============ */}
          {activeTab === '起名' && (
            <motion.div
              key="view-generate"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
              className="space-y-6 md:space-y-8"
              id="generate-tab-view"
            >
              {/* 标语 */}
              <section className="text-center max-w-2xl mx-auto space-y-2 mt-1 md:mt-2" id="slogan-section">
                <h2 className="text-xl md:text-2.5xl font-black tracking-widest text-[#2c3e50] font-sans" id="slogan-heading">
                  云生雅序 · 择优为名
                </h2>
                <p className="text-[11px] text-neutral-500 max-w-sm sm:max-w-md mx-auto leading-relaxed" id="slogan-desc">
                  融汇清雅与现代美学，凝炼独一无二的世间雅称。
                </p>
              </section>

              {/* 流程输入控制箱 */}
              <section className="bg-white border border-neutral-150 rounded-3xl p-5 md:p-8 shadow-3xs max-w-3xl mx-auto w-full select-none" id="input-control-box">
                <div className="space-y-6" id="wizard-steps-container">
                  
                  {/* 起名场景瓷盘 */}
                  <div className="space-y-2.5" id="step-scene-selection">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black text-neutral-400 tracking-widest uppercase block">
                        01. 起名场景择定 <span className="text-rose-400 ml-0.5">*</span>
                      </label>
                      <span className="text-[9.5px] text-[#6b8a9e] font-bold">任选其中一项</span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5" id="scene-piles">
                      {SCENE_OPTIONS.map((item) => {
                        const isCur = scene === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setScene(item.id);
                              addToast(`已切入「${item.name}」场景`, 'info');
                            }}
                            className={`p-3.5 rounded-2xl border text-center font-extrabold text-xs transition-all active:scale-[0.96] cursor-pointer flex items-center justify-center min-h-[44px] ${
                              isCur
                                ? 'bg-[#6b8a9e]/10 border-[#6b8a9e] text-[#5c7c8c] shadow-3xs'
                                : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-600'
                            }`}
                            id={`scene-pile-item-${item.id}`}
                          >
                            <span>{item.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 固定姓氏 */}
                  <div className="space-y-2.5" id="step-surname-input">
                    <label className="text-[11px] font-black text-neutral-400 tracking-widest uppercase block" htmlFor="surname-field">
                      02. 固定尊姓 <span className="text-neutral-400 font-bold ml-1">(选填)</span>
                    </label>
                    <div className="relative flex items-center max-w-sm" id="surname-field-container">
                      <div className="absolute left-3.5 text-neutral-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        id="surname-field"
                        placeholder="例：苏、诸葛 (未填则默认纯名)"
                        value={surname}
                        onChange={(e) => handleSurnameChange(e.target.value)}
                        className="w-full bg-neutral-50/50 border border-neutral-200 focus:border-[#6b8a9e] focus:bg-white rounded-2xl pl-10 pr-12 py-3 text-xs font-bold outline-none transition-all placeholder:text-neutral-400 placeholder:font-bold"
                      />
                      {surname && (
                        <button
                          onClick={() => handleSurnameChange('')}
                          className="absolute right-3.5 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] active:scale-90"
                          id="clear-surname-btn"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 字数选择 */}
                  <div className="space-y-2.5" id="step-length-selection">
                    <label className="text-[11px] font-black text-neutral-400 tracking-widest uppercase block">
                      03. 字数选取 <span className="text-rose-400 ml-0.5">*</span>
                    </label>
                    <div className="flex gap-2.5 max-w-sm" id="length-radio-group">
                      {[2, 3, 4].map((num) => {
                        const isSel = length === num;
                        return (
                          <button
                            key={num}
                            onClick={() => setLength(num as 2 | 3 | 4)}
                            className={`flex-1 text-center py-2.5 text-xs font-black rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                              isSel
                                ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                            }`}
                            id={`length-btn-${num}`}
                          >
                            {num} 个字
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 风格标签选择 */}
                  <div className="space-y-2.5" id="step-styles-selection">
                    <div className="flex items-center justify-between" id="step-styles-header">
                      <label className="text-[11px] font-black text-neutral-400 tracking-widest uppercase block">
                        04. 风格志向筛选 <span className="text-rose-400 ml-0.5">* (可合多选择)</span>
                      </label>
                      {selectedStyles.length > 0 && (
                        <button
                          onClick={() => setSelectedStyles([])}
                          className="text-[10px] text-[#6b8a9e] hover:text-[#5c7c8c] font-black cursor-pointer bg-neutral-100 px-2 py-1 rounded-lg"
                          id="clear-selected-styles"
                        >
                          重置风格
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" id="style-chips-wrapper">
                      {STYLE_OPTIONS.map((style) => {
                        const isSelected = selectedStyles.includes(style.id);
                        return (
                          <button
                            key={style.id}
                            onClick={() => toggleStyle(style.id)}
                            className={`px-3.5 py-2.5 text-xs font-bold rounded-2xl cursor-pointer transition-all border active:scale-92 flex items-center justify-center gap-1.5 ${
                              isSelected
                                ? 'bg-[#6b8a9e] text-white border-[#6b8a9e] shadow-3xs'
                                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                            }`}
                            id={`style-chip-${style.id}`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white inline-block animate-ping" />}
                            <span>{style.name}</span>
                          </button>
                        );
                      })}
                    </div>
                    
                    {selectedStyles.length === 0 && (
                      <p className="text-[10px] text-rose-500 font-medium" id="style-disclaimer-notice">
                        ⚠️ 请至少勾选一种主攻风格才能点击云序起名。
                      </p>
                    )}
                  </div>

                  {/* 桌面端大起名按钮 */}
                  <div className="hidden md:flex pt-4 border-t border-neutral-100 gap-3" id="main-generation-actions">
                    <button
                      disabled={!canGenerate || isGenerating}
                      onClick={handleGenerate}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-xs font-black tracking-widest transition-all duration-150 cursor-pointer ${
                        canGenerate && !isGenerating
                          ? 'bg-[#6b8a9e] hover:bg-[#5c7c8c] text-white shadow-sm active:scale-[0.98]'
                          : 'bg-neutral-100 border border-neutral-200 text-neutral-400 cursor-not-allowed'
                      }`}
                      id="trigger-generate-btn"
                    >
                      {isGenerating ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin text-white/70" />
                          <span>正在雕琢气韵名字...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-white/90 animate-bounce" />
                          <span>一键生成 10 枚新名字</span>
                        </>
                      )}
                    </button>

                    {cards.length > 0 && (
                      <button
                        onClick={handleGenerate}
                        className="px-5 py-3 border border-neutral-200 hover:bg-neutral-50 text-xs font-black text-neutral-700 hover:text-neutral-900 rounded-2xl transition-all active:scale-[0.98] cursor-pointer"
                        id="trigger-regenerate-btn"
                      >
                        重选本批
                      </button>
                    )}
                  </div>

                </div>
              </section>

              {/* 名字卡片展示区 (包含 ref) */}
              <section className="space-y-5 scroll-mt-20" ref={resultsRef} id="output-cards-section">
                {/* 生成区头部 */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-200 pb-3" id="output-section-header">
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-neutral-950 tracking-wider uppercase flex items-center gap-1.5 animate-fade-in">
                      <Compass className="w-4 h-4 text-[#6b8a9e]" />
                      名字大屏展示盘
                    </h3>
                    <p className="text-[10px] text-neutral-400 mt-0.5" id="results-count-guide">
                      依凭「{SCENE_OPTIONS.find((s) => s.id === scene)?.name}」气魄，已为您琢洗 10 枚珠圆玉润的卓尔美称：
                    </p>
                  </div>
                  
                  {cards.length > 0 && (
                    <span className="text-[9px] bg-[#8fa385]/10 text-[#6c8560] px-2.5 py-1 rounded-xl inline-block font-black border border-[#8fa385]/10">
                      支持 100% 离线高清矢量卡下载
                    </span>
                  )}
                </div>

                {/* 卡片栏 */}
                {cards.length === 0 ? (
                  <div className="bg-white border border-neutral-150 rounded-3xl p-14 text-center shadow-3xs" id="cards-empty-placeholder">
                    <Compass className="w-12 h-12 text-neutral-200 mx-auto mb-3 animate-spin" style={{ animationDuration: '6s' }} />
                    <h4 className="text-xs font-black text-neutral-700">尚未探索名字</h4>
                    <p className="text-[10px] text-neutral-400 max-w-xs mx-auto mt-1 leading-normal">
                      请先点勾风格标签，再点击下方“一键云序择名”按钮触发字韵探索。
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" id="cards-grid">
                    {cards.map((card, idx) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04, type: 'spring', damping: 20 }}
                        className="h-full"
                        id={`grid-item-container-${card.id}`}
                      >
                        <NameCard
                          card={card}
                          isCollected={isCardCollected(card)}
                          onToggleCollect={() => handleToggleCollect(card)}
                          onCopyToClipboard={() => handleCopyToClipboard(card)}
                          onOpenPoster={() => setActivePosterCard(card)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {/* ============ TABS 02: 我的收藏板块 (直接展示) ============ */}
          {activeTab === '收藏' && (
            <motion.div
              key="view-collect"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
              className="max-w-4xl mx-auto w-full space-y-6"
              id="collect-tab-view"
            >
              {/* 板块介绍 */}
              <div className="text-center max-w-xl mx-auto space-y-1.5" id="favorites-title-block">
                <h3 className="text-lg font-black text-neutral-900 tracking-wide">我的收藏</h3>
                <p className="text-[11px] text-neutral-500 leading-normal">
                  您所有手工收藏的名字和诗意均离线封存于本设备。
                </p>
              </div>

              {/* 过滤搜索与清空工具栏 */}
              <div className="bg-white border border-neutral-150 p-4 rounded-2.5xl shadow-3xs flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" id="favorites-tools">
                <div className="relative flex-1" id="favorites-search-bar">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="输入收藏名或诗意、经典原句来搜寻..."
                    value={faveSearch}
                    onChange={(e) => setFaveSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-neutral-200 outline-none focus:border-[#6b8a9e] transition-all font-bold placeholder:text-neutral-400"
                    id="fave-tab-search-input"
                  />
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-3" id="favorites-actions">
                  <span className="text-[10px] text-neutral-450 font-bold">
                    匹配所得: <strong className="text-neutral-800 font-black">{filteredCollected.length}</strong> 件
                  </span>
                  
                  {collected.length > 0 && (
                    <button
                      onClick={handleClearCollections}
                      className="text-red-500 hover:text-red-650 transition-colors cursor-pointer font-black text-[10.5px] border border-red-100 bg-red-50/40 p-1.5 px-3 rounded-xl hover:bg-red-50 active:scale-95"
                      id="fave-tab-clear-all"
                    >
                      清空我的收藏
                    </button>
                  )}
                </div>
              </div>

              {/* 收藏名字内容栏 */}
              {filteredCollected.length === 0 ? (
                <div className="bg-white border border-neutral-150 rounded-3xl p-16 text-center shadow-3xs" id="faves-empty-block">
                  <div className="w-14 h-14 rounded-full bg-neutral-50 flex items-center justify-center mb-4 mx-auto border border-neutral-100">
                    <Heart className="w-6 h-6 text-neutral-300" />
                  </div>
                  <h4 className="text-xs font-black text-neutral-700">收藏列表一片空白</h4>
                  <p className="text-[10px] text-neutral-400 max-w-xs mx-auto mt-1 leading-normal">
                    {faveSearch ? '未搜索到匹配项，您可放宽关键字搜索。' : '起名后，点勾名字下方的“收藏”即可将精选之名保留在此。'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="fave-cards-grid">
                  {filteredCollected.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-neutral-150 rounded-2.5xl p-5 hover:border-neutral-300 transition-all flex flex-col justify-between shadow-3xs hover:shadow-xs relative"
                      id={`fave-item-${item.id}`}
                    >
                      <div className="space-y-3">
                        {/* 名字大字与所属场景 */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-end gap-0.5">
                            {item.surname && (
                              <span className="text-sm text-neutral-400 font-light mb-0.5">{item.surname}</span>
                            )}
                            <span className="text-xl font-black text-neutral-800 tracking-wider pl-0.5">{item.name}</span>
                          </div>
                          <span className="text-[9px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded font-black max-w-[80px] truncate">
                            {getSceneName(item.scene)}
                          </span>
                        </div>

                        {/* 诗意释义 */}
                        <p className="text-xs text-neutral-600 leading-relaxed font-sans">{item.meaning}</p>
                        
                        {item.source && (
                          <span className="text-[9.5px] font-bold bg-[#8fa385]/5 text-[#6c8560] py-0.5 px-2 rounded-md border border-[#8fa385]/10 inline-block">
                            典原：{item.source}
                          </span>
                        )}
                      </div>

                      {/* 卡片高雅触控手柄：移除、海报、复用 */}
                      <div className="mt-5 pt-3.5 border-t border-neutral-100 flex items-center justify-between gap-1.5 text-xs text-neutral-500 font-bold">
                        <button
                          onClick={() => handleRemoveCollection(item.id)}
                          className="flex items-center gap-1 py-1.5 px-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-neutral-50 transition-all cursor-pointer font-bold"
                          title="从我的收藏中移除"
                          id={`delete-fave-${item.id}`}
                        >
                          <HeartOff className="w-3.5 h-3.5" />
                          <span>移除</span>
                        </button>

                        <button
                          onClick={() => setActivePosterCard(item)}
                          className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl border border-neutral-200 bg-white text-[#6b8a9e] hover:bg-[#6b8a9e]/5 active:scale-95 transition-all cursor-pointer"
                          id={`poster-fave-${item.id}`}
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>美图海报</span>
                        </button>

                        <button
                          onClick={() => handleReuseAndRegen({
                            scene: item.scene,
                            surname: item.surname,
                            length: item.name.length as 2 | 3 | 4,
                            styles: item.styles,
                          })}
                          className="flex items-center gap-0.5 font-bold text-neutral-800 hover:text-[#6b8a9e] transition-colors cursor-pointer py-1.5"
                          id={`reuse-fave-${item.id}`}
                        >
                          <span>复用配置</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ============ TABS 03: 历史生成板块 ============ */}
          {activeTab === '历史' && (
            <motion.div
              key="view-history"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
              className="max-w-2xl mx-auto w-full space-y-6"
              id="history-tab-view"
            >
              {/* 说明块 */}
              <div className="text-center max-w-xl mx-auto space-y-1" id="history-header-block">
                <h3 className="text-lg font-black text-neutral-900 tracking-wide">起名批次备忘录</h3>
                <p className="text-[11px] text-neutral-500 leading-normal">
                  为您自动留存最近 10 次成功的运行参数和生成的十枚候选名。
                </p>
              </div>

              {history.length > 0 && (
                <div className="flex justify-end" id="history-batch-clean">
                  <button
                    onClick={handleClearHistory}
                    className="text-red-500 hover:text-red-600 font-bold transition-all text-xs border border-red-100 bg-red-50/30 px-3 py-1.5 rounded-xl hover:bg-red-50 active:scale-95 cursor-pointer"
                    id="history-btn-clear"
                  >
                    清空足迹备忘录
                  </button>
                </div>
              )}

              {history.length === 0 ? (
                <div className="bg-white border border-neutral-150 rounded-3xl p-16 text-center shadow-3xs" id="history-empty-block">
                  <div className="w-14 h-14 rounded-full bg-neutral-50 flex items-center justify-center mb-4 mx-auto border border-neutral-100">
                    <History className="w-6 h-6 text-neutral-300" />
                  </div>
                  <h4 className="text-xs font-black text-neutral-700">起名足迹一尘不染</h4>
                  <p className="text-[10px] text-neutral-400 max-w-xs mx-auto mt-1 leading-normal">
                    一旦您在起名页点击“生成”触发探索，历史批次数据即会自动记录在这里。
                  </p>
                </div>
              ) : (
                <div className="space-y-4" id="history-items-container">
                  {history.map((rec) => {
                    const formattedTime = new Date(rec.timestamp).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    });
                    const formattedDate = new Date(rec.timestamp).toLocaleDateString('zh-CN', {
                      month: 'short',
                      day: 'numeric'
                    });
                    return (
                      <div
                        key={rec.id}
                        className="bg-white border border-neutral-150 rounded-2.5xl p-5 hover:border-neutral-200 transition-all flex flex-col gap-4 shadow-3xs"
                        id={`history-row-${rec.id}`}
                      >
                        {/* 头部元数据 */}
                        <div className="flex items-center justify-between border-b border-neutral-50 pb-3" id={`history-meta-${rec.id}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-neutral-400 font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded-md">
                              {formattedDate} {formattedTime}
                            </span>
                            <span className="text-xs font-black text-[#6b8a9e]">
                              {getSceneName(rec.config.scene)} · {rec.config.length}字
                            </span>
                          </div>
                          
                          <span className="hidden xs:inline text-[10px] text-neutral-450 font-bold bg-neutral-50 border border-neutral-150 px-2 py-1 rounded-md">
                            风格数: {rec.config.styles.length} 个
                          </span>
                        </div>

                        {/* 生成名字序列 */}
                        <div className="flex flex-wrap gap-1.5" id={`history-names-${rec.id}`}>
                          {rec.generatedCards.map((g, gi) => (
                            <span
                              key={`${rec.id}-${gi}`}
                              className="bg-neutral-50/50 border border-neutral-150/80 px-3 py-1.5 rounded-2xl text-xs font-black text-neutral-800"
                            >
                              {g.surname ? `${g.surname}${g.name}` : g.name}
                            </span>
                          ))}
                        </div>

                        {/* 操作：重新加载 */}
                        <div className="pt-2 border-t border-dashed border-neutral-100 flex justify-between items-center" id={`history-actions-${rec.id}`}>
                          <span className="text-[9.5px] text-neutral-400">一键恢复当时的场景与风格，重新择选</span>
                          
                          <button
                            onClick={() => handleReuseAndRegen(rec.config)}
                            className="flex items-center gap-1 bg-white border border-neutral-200 hover:border-neutral-300 text-neutral-700 hover:text-neutral-950 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                            id={`history-reuse-btn-${rec.id}`}
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
            </motion.div>
          )}

          {/* ============ TABS 04: 系统设置板块 ============ */}
          {activeTab === '设置' && (
            <motion.div
              key="view-settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
              className="max-w-2xl mx-auto w-full space-y-6"
              id="settings-tab-view"
            >
              {/* 关于我们部分 */}
              <div className="bg-white border border-neutral-150 p-6 rounded-2.5xl shadow-3xs space-y-4" id="setting-about-card">
                <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                  <Compass className="w-4.5 h-4.5 text-[#6b8a9e]" />
                  <span>关于 “云序择名”</span>
                </h4>
                
                <div className="text-xs text-neutral-600 space-y-3 leading-relaxed font-sans">
                  <p className="font-extrabold text-neutral-800">
                    云生雅序，择优为名。
                  </p>
                  <p>
                    「云序择名」是一款极简主义、纯国风色系的名字择选工具，每个推荐方案均深度考量了古典汉语言文学的语流连贯性、反切平仄标音，结合高纯度自然色背景美学模板，为您实现舒适、沉浸的雅致观感！
                  </p>
                  <p className="text-amber-600 font-medium">
                    温馨提示：所有生成的名字仅供参考，请拒绝任何封建迷信！
                  </p>
                </div>
              </div>

              {/* 隐私及安全政策 */}
              <div className="bg-white border border-neutral-150 p-6 rounded-2.5xl shadow-3xs space-y-4" id="setting-privacy-card">
                <h4 className="text-xs font-black text-neutral-900 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#8fa385]" />
                  <span>隐私政策与数据安全</span>
                </h4>
                
                <div className="pt-2 border-t border-neutral-100 space-y-3" id="setting-action-row-privacy">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-150">
                    <div>
                      <h5 className="font-extrabold text-neutral-800 text-[11px]">用户服务协议</h5>
                      <p className="text-[10px] text-neutral-400 mt-0.5 font-sans">了解您使用本应用的权利与义务</p>
                    </div>
                    
                    <button
                      onClick={() => setShowAgreementModal(true)}
                      className="px-4 py-2 bg-white border border-neutral-200 text-neutral-750 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900 active:scale-95 transition-all text-xs font-black rounded-xl cursor-pointer shadow-3xs flex items-center gap-1.5"
                      id="settings-view-agreement-btn"
                    >
                      <span>查看协议</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                    </button>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-150">
                    <div>
                      <h5 className="font-extrabold text-neutral-800 text-[11px]">隐私政策承诺</h5>
                      <p className="text-[10px] text-neutral-400 mt-0.5 font-sans">云序择名极其重视和妥善保护您的个人信息资产安全</p>
                    </div>
                    
                    <button
                      onClick={() => setShowPrivacyDetailModal(true)}
                      className="px-4 py-2 bg-white border border-neutral-200 text-neutral-750 hover:bg-neutral-50 hover:border-neutral-300 hover:text-neutral-900 active:scale-95 transition-all text-xs font-black rounded-xl cursor-pointer shadow-3xs flex items-center gap-1.5"
                      id="settings-view-privacy-btn"
                    >
                      <span>查看政策</span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-500" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 操作中心：清空数据 */}
              <div className="bg-white border border-neutral-150 p-6 rounded-2.5xl shadow-3xs space-y-4" id="setting-data-management-card">
                <h4 className="text-xs font-black text-neutral-900 tracking-wider">数据归零管理</h4>
                
                <div className="pt-2 border-t border-red-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-red-55/60 rounded-2xl border" id="setting-action-row-history">
                  <div>
                    <h5 className="font-extrabold text-red-800 text-[11px]">抹去全部批次历史数据</h5>
                    <p className="text-[10px] text-red-450 mt-0.5 font-sans">即刻清比起名字库足迹（对您的收藏夹库无任何影响）</p>
                  </div>
                  
                  <button
                    onClick={handleClearHistory}
                    className="px-4 py-2 bg-white border border-red-200 text-red-650 hover:bg-red-50 hover:border-red-300 active:scale-95 transition-all text-xs font-black rounded-xl cursor-pointer shadow-3xs"
                    id="settings-wipe-history-btn"
                  >
                    抹去历史
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
        )}

      </main>

      {/* ============ 手机专属底部核心导航栏 (Smart Mobile Bottom Navigation Bar) ============ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-150 shadow-[0_-4px_16px_rgba(0,0,0,0.035)] flex items-center justify-around py-2 px-1 select-none" id="mobile-bottom-nav">
        
        {/* 起名 tab */}
        <button
          onClick={() => {
            setActiveTab('起名');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 transition-all relative ${
            activeTab === '起名' ? 'text-[#6b8a9e]' : 'text-neutral-400 hover:text-neutral-600'
          }`}
          id="nav-btn-generate"
        >
          <Compass className={`w-5 fill-none transition-transform ${activeTab === '起名' ? 'scale-110 stroke-[2.3px] text-[#6b8a9e]' : 'scale-100 text-neutral-400'}`} />
          <span className="text-[9.5px] font-black mt-1 tracking-wider">智能起名</span>
          {activeTab === '起名' && (
            <motion.span layoutId="nav-line-indicator" className="absolute top-0 w-8 h-0.5 bg-[#6b8a9e] rounded-full" />
          )}
        </button>

        {/* 收藏 tab */}
        <button
          onClick={() => {
            setActiveTab('收藏');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 transition-all relative ${
            activeTab === '收藏' ? 'text-rose-400' : 'text-neutral-400 hover:text-neutral-600'
          }`}
          id="nav-btn-collect"
        >
          <div className="relative">
            <Heart className={`w-5 transition-transform ${activeTab === '收藏' ? 'scale-110 fill-rose-400 text-rose-400' : 'scale-100 text-neutral-400'}`} />
            {collected.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-bold text-[8.5px] w-4 h-4 rounded-full flex items-center justify-center aspect-square shadow-sm scale-90">
                {collected.length}
              </span>
            )}
          </div>
          <span className="text-[9.5px] font-black mt-1 tracking-wider">我的收藏</span>
          {activeTab === '收藏' && (
            <motion.span layoutId="nav-line-indicator" className="absolute top-0 w-8 h-0.5 bg-rose-400 rounded-full" />
          )}
        </button>

        {/* 历史 tab */}
        <button
          onClick={() => {
            setActiveTab('历史');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 transition-all relative ${
            activeTab === '历史' ? 'text-[#8fa385]' : 'text-neutral-400 hover:text-neutral-600'
          }`}
          id="nav-btn-history"
        >
          <History className={`w-5 transition-transform ${activeTab === '历史' ? 'scale-110 stroke-[2.3px] text-[#8fa385]' : 'scale-100 text-neutral-400'}`} />
          <span className="text-[9.5px] font-black mt-1 tracking-wider">生成历史</span>
          {activeTab === '历史' && (
            <motion.span layoutId="nav-line-indicator" className="absolute top-0 w-8 h-0.5 bg-[#8fa385] rounded-full" />
          )}
        </button>

        {/* 设置 tab */}
        <button
          onClick={() => {
            setActiveTab('设置');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 transition-all relative ${
            activeTab === '设置' ? 'text-neutral-800' : 'text-neutral-400 hover:text-neutral-600'
          }`}
          id="nav-btn-settings"
        >
          <Settings className={`w-5 transition-transform ${activeTab === '设置' ? 'scale-110 stroke-[2.3px] text-neutral-800' : 'scale-100 text-neutral-400'}`} />
          <span className="text-[9.5px] font-black mt-1 tracking-wider font-sans">系统设置</span>
          {activeTab === '设置' && (
            <motion.span layoutId="nav-line-indicator" className="absolute top-0 w-8 h-0.5 bg-neutral-800 rounded-full" />
          )}
        </button>
      </div>

      {/* 手机专属「智能起名」下浮动的微型快捷生成操作条 (Floating Generation Button - only visible on Name Generator page) */}
      {activeTab === '起名' && (
        <div className="md:hidden fixed bottom-[72px] left-6 right-6 z-40 select-none animate-bounce" id="mobile-quick-action-fab">
          <button
            disabled={!canGenerate || isGenerating}
            onClick={handleGenerate}
            className={`w-full h-12 flex items-center justify-center gap-1.5 rounded-2xl text-xs font-black tracking-widest transition-all border outline-none cursor-pointer active:scale-[0.95] ${
              canGenerate && !isGenerating
                ? 'bg-[#6b8a9e] border-[#6b8a9e] text-white shadow-[0_4px_16px_rgba(107,138,158,0.35)]'
                : 'bg-neutral-100 border-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
            id="dock-generate-trigger"
          >
            {isGenerating ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-white/80" />
                <span>智能琢选中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                <span>一键云序起名 (10 枚)</span>
              </>
            )}
          </button>
        </div>
      )}


      {/* 海报模态浮窗（100%离线SVG下载） */}
      {activePosterCard && (
        <PosterModal
          card={activePosterCard}
          onClose={() => setActivePosterCard(null)}
          onToast={addToast}
        />
      )}

      {/* 隐私政策同意弹窗 */}
      <AnimatePresence>
        {showPrivacyModal && (
          <PrivacyModal
            onAccept={handlePrivacyAccept}
            onDecline={handlePrivacyDecline}
            onOpenAgreement={handleOpenAgreement}
            onOpenPrivacy={handleOpenPrivacy}
          />
        )}
        
        {/* 用户协议详情弹窗 */}
        {showAgreementModal && (
          <AgreementModal
            onClose={() => setShowAgreementModal(false)}
            title="用户服务协议"
            content={<UserAgreementContent />}
          />
        )}
        
        {/* 隐私政策详情弹窗 */}
        {showPrivacyDetailModal && (
          <AgreementModal
            onClose={() => setShowPrivacyDetailModal(false)}
            title="隐私政策"
            content={<PrivacyPolicyContent />}
          />
        )}
        
        {/* 拒绝确认弹窗 */}
        {showDeclineModal && (
          <DeclineConfirmModal
            onConfirm={handleDeclineConfirm}
            onCancel={handleDeclineCancel}
          />
        )}
      </AnimatePresence>

      {/* 隐私政策抽屉/弹窗 */}
      <AnimatePresence>
        {privacyOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 select-none" id="privacy-policy-overlay">
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPrivacyOpen(false)}
              className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs cursor-pointer"
              id="privacy-backdrop"
            />
            
            {/* 弹窗主体 */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white border border-neutral-150 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col relative max-h-[80vh] z-10"
              id="privacy-modal-box"
            >
              {/* 头部标题 */}
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50" id="privacy-header">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#8fa385]" />
                  <span className="text-xs font-black text-neutral-900 tracking-wider">《隐私政策与数据安全承诺》</span>
                </div>
                <button
                  onClick={() => setPrivacyOpen(false)}
                  className="w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 border border-neutral-200/50 flex items-center justify-center text-neutral-500 font-bold text-xs select-none cursor-pointer transition-colors active:scale-90"
                  id="close-privacy-btn"
                >
                  ✕
                </button>
              </div>

              {/* 内容滚动区 */}
              <div className="p-5 overflow-y-auto space-y-4 text-[11px] text-neutral-600 leading-relaxed font-sans" id="privacy-content-scroll">
                <p className="font-extrabold text-neutral-800 text-[11.5px] leading-normal">
                  我们对您的数字隐私权持极为严正、毫不妥协的学术态度。因此，云序择名采用了行业最极致的「沙盒安全零交互」架构：
                </p>

                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-neutral-50 rounded-xl space-y-1 border border-neutral-100" id="p-item-1">
                    <h5 className="font-extrabold text-neutral-800 text-[10.5px]">一、无后端或接口，实现设备独立运行</h5>
                    <p className="text-neutral-500 text-[10px]">
                      本系统全部编撰代码、字库数据及名号生成规则均随打包文件100%本地载入。工具内部未预置任何后台接口、远程追踪API或分析遥测服务，您的每次点击或起名规则极高私密，绝不会经由网络上载。
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl space-y-1 border border-neutral-100" id="p-item-2">
                    <h5 className="font-extrabold text-neutral-800 text-[10.5px]">二、本机本地物理级存留</h5>
                    <p className="text-neutral-500 text-[10px]">
                      您的搜索历史、精选收藏数据，仅持续保存在您本机浏览器的 LocalStorage 中。此类隐私数据永远不会跨出系统外溢。
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl space-y-1 border border-neutral-100" id="p-item-3">
                    <h5 className="font-extrabold text-neutral-800 text-[10.5px]">三、用户对数据的物理删除掌控权</h5>
                    <p className="text-neutral-500 text-[10px]">
                      在「系统设置 - 数据归零管理」中，您可随时物理擦除本地起名足迹，或者在收藏板块中取消，确保不残留任何涉及您或您意中家庭成员名字的局部回忆。
                    </p>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl space-y-1 border border-neutral-100" id="p-item-4">
                    <h5 className="font-extrabold text-neutral-800 text-[10.5px]">四、免责声明</h5>
                    <p className="text-neutral-500 text-[10px]">
                      本产品旨在汉文学美声、平仄气温学、当代装帧美字等领域的辅助生成探索，展示之释义皆取材自传世古籍史书。起名方案并无特定吉凶断言等神秘宿命暗示，亦不构成本产品对任何个体行为及决策的指向。
                    </p>
                  </div>
                </div>

                <p className="text-center text-neutral-400 text-[9px] pt-3 border-t border-neutral-100" id="privacy-date">
                  最新生效日期：2026年6月3日
                </p>
              </div>

              {/* 尾部确认 */}
              <div className="p-4 border-t border-neutral-100 bg-neutral-50/50 flex justify-end" id="privacy-footer">
                <button
                  onClick={() => setPrivacyOpen(false)}
                  className="px-5 py-2.5 bg-[#6b8a9e] hover:bg-[#5c7c8c] text-white font-extrabold text-[11px] rounded-xl cursor-pointer active:scale-95 transition-all shadow-3xs"
                  id="confirm-privacy-btn"
                >
                  我知道了
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 提示层 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
