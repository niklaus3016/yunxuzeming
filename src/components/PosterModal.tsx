/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Download, Share2, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { NameCardType } from '../types';
import { STYLE_OPTIONS, SCENE_OPTIONS } from '../data';

interface PosterModalProps {
  card: NameCardType;
  onClose: () => void;
  onToast: (msg: string, type: 'success' | 'info') => void;
}

type PosterTheme = 'misty_blue' | 'sage_green' | 'gallery_white';

export function PosterModal({ card, onClose, onToast }: PosterModalProps) {
  const [theme, setTheme] = useState<PosterTheme>('misty_blue');

  const themeConfig = {
    misty_blue: {
      bg: 'bg-[#f0f4f6]',
      cardBg: 'bg-[#ffffff]',
      textColor: 'text-[#2c3e50]',
      primaryColor: '#6b8a9e',
      secBg: 'bg-[#f4f7f9]',
      accentColor: '#6b8a9e',
      borderStyle: 'border-[#6b8a9e]/20',
      labelStyle: 'text-[#6b8a9e] bg-[#6b8a9e]/10',
    },
    sage_green: {
      bg: 'bg-[#f4f6f1]',
      cardBg: 'bg-[#ffffff]',
      textColor: 'text-[#2c352a]',
      primaryColor: '#8fa385',
      secBg: 'bg-[#f6f8f4]',
      accentColor: '#8fa385',
      borderStyle: 'border-[#8fa385]/20',
      labelStyle: 'text-[#8fa385] bg-[#8fa385]/10',
    },
    gallery_white: {
      bg: 'bg-[#fafafa]',
      cardBg: 'bg-[#ffffff]',
      textColor: 'text-[#1a1a1a]',
      primaryColor: '#1a1a1a',
      secBg: 'bg-[#f7f7f7]',
      accentColor: '#1a1a1a',
      borderStyle: 'border-[#1a1a1a]/15',
      labelStyle: 'text-neutral-700 bg-neutral-100',
    },
  };

  const getSceneName = () => {
    return SCENE_OPTIONS.find((s) => s.id === card.scene)?.name || '';
  };

  const getStylesString = () => {
    return card.styles.map((s) => STYLE_OPTIONS.find((so) => so.id === s)?.name || '').join(' · ');
  };

  // 生成并下载 SVG 画幅
  const downloadSVG = () => {
    const activeConf = themeConfig[theme];
    const width = 800;
    const height = 1200;

    // 清晰分割姓氏与名字
    const hasSurname = !!card.surname;
    const displayName = card.name;
    const displaySurname = card.surname || '';

    // 绘制矢量海报图形
    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <!-- 背景 -->
  <rect width="100%" height="100%" fill="${theme === 'misty_blue' ? '#f0f4f6' : theme === 'sage_green' ? '#f4f6f1' : '#f5f5f5'}" />
  
  <!-- 内衬卡面板 -->
  <rect x="50" y="50" width="700" height="1100" rx="24" fill="#ffffff" filter="drop-shadow(0 10px 30px rgba(0,0,0,0.03))" />
  
  <!-- 细线边饰 -->
  <rect x="70" y="70" width="660" height="1060" rx="16" fill="none" stroke="${activeConf.primaryColor}" stroke-opacity="0.15" stroke-width="2" />
  
  <!-- 品牌水印 -->
  <text x="400" y="110" font-family="sans-serif" font-size="20" font-weight="600" fill="${activeConf.primaryColor}" fill-opacity="0.4" text-anchor="middle" letter-spacing="8">云序择名</text>
  <text x="400" y="140" font-family="sans-serif" font-size="12" fill="#aaaaaa" text-anchor="middle" letter-spacing="2">Y U N  X U  Z E  M I N G</text>
  
  <line x1="150" y1="180" x2="650" y2="180" stroke="#f0f0f0" stroke-width="1" />

  <!-- 主视觉区 — 姓氏与名大字 -->
  ${
    hasSurname
      ? `
      <text x="400" y="320" font-family="sans-serif" font-size="52" fill="#a0a0a0" text-anchor="middle" font-weight="300" letter-spacing="4">${displaySurname}</text>
      <text x="400" y="470" font-family="sans-serif" font-size="105" fill="#1a1a1a" font-weight="bold" text-anchor="middle" letter-spacing="16">${displayName}</text>
      `
      : `
      <text x="400" y="420" font-family="sans-serif" font-size="115" fill="#1a1a1a" font-weight="bold" text-anchor="middle" letter-spacing="20">${displayName}</text>
      `
  }

  <!-- 场景与风格圈 -->
  <rect x="300" y="560" width="200" height="34" rx="17" fill="${activeConf.primaryColor}" fill-opacity="0.08" />
  <text x="400" y="582" font-family="sans-serif" font-size="13" font-weight="500" fill="${activeConf.primaryColor}" text-anchor="middle" letter-spacing="1">${getSceneName()} · ${getStylesString()}</text>

  <line x1="240" y1="650" x2="560" y2="650" stroke="#eeeeee" stroke-width="1.5" stroke-dasharray="6 6" />

  <!-- 名字大说解释（分行渲染） -->
  <foreignObject x="150" y="700" width="500" height="240">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: sans-serif; font-size: 18px; color: #444444; line-height: 1.8; text-align: center; text-justify: inter-word;">
      ${card.meaning}
    </div>
  </foreignObject>

  ${
    card.source
      ? `
  <!-- 出处古卷 -->
  <rect x="250" y="930" width="300" height="36" rx="6" fill="#fcfcfc" stroke="#eeeeee" stroke-width="1" />
  <text x="400" y="953" font-family="sans-serif" font-size="12" fill="#888888" text-anchor="middle">典原：${card.source}</text>
  `
      : ''
  }

  <!-- 底部装点，彰显无感国风、仅留几何雅致 -->
  <circle cx="400" cy="1030" r="4" fill="${activeConf.primaryColor}" fill-opacity="0.5" />
  <text x="400" y="1070" font-family="sans-serif" font-size="13" fill="#999999" text-anchor="middle" letter-spacing="2">云生雅序，择优为名</text>
  <text x="400" y="1090" font-family="sans-serif" font-size="10" fill="#cccccc" text-anchor="middle">趣味研究之选，唯择此名</text>
</svg>
`;

    // 写入下载
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `云序择名_${card.surname}${card.name}_海报.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onToast('已成功下载高清矢量海报(SVG格式)。', 'success');
  };

  // 复制文字排班
  const copyFormattedText = () => {
    const fullName = card.surname ? `${card.surname}${card.name}` : card.name;
    const textFormat = 
`—— 云 序 择 名 | 首 选 雅 词 ——
【姓名】：${fullName}
【类别】：${getSceneName()} (${getStylesString()})
【解析】：${card.meaning}
${card.source ? `【典籍】：${card.source}` : ''}
云生雅序，择优为名。`;

    navigator.clipboard.writeText(textFormat).then(() => {
      onToast('已成功复制文字图贴排版，可直接分享！', 'success');
    });
  };

  const active = themeConfig[theme];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200" id="poster-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 260 }}
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
        id="poster-modal-body"
      >
        {/* Modal 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 flex-shrink-0" id="poster-modal-header">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-neutral-800" id="poster-title">名字美学海报</h3>
            <p className="text-[10px] text-neutral-500 mt-0.5" id="poster-subtitle">
              定制一块专属纯白雅致的名字美学卡
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 px-3 rounded-xl border border-neutral-150 hover:bg-neutral-50 active:scale-95 transition-all text-neutral-500 cursor-pointer text-[11px] font-bold flex items-center gap-1"
            id="close-poster-btn"
          >
            <X className="w-3.5 h-3.5" />
            关闭
          </button>
        </div>

        {/* 核心预览与主题选择 */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4 sm:gap-5" id="poster-modal-content">
          {/* 选项卡：主题挑选 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-neutral-50 p-2.5 rounded-2xl" id="poster-theme-options">
            <span className="text-[10px] sm:text-[11px] font-bold text-neutral-500 pl-1.5">选择海报雅致滤镜：</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setTheme('misty_blue')}
                className={`flex-1 sm:flex-initial text-center px-3.5 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                  theme === 'misty_blue'
                    ? 'bg-[#6b8a9e] text-white border-[#6b8a9e] shadow-[0_2px_8px_rgba(107,138,158,0.2)]'
                    : 'bg-white border-[#e5e5e5] text-neutral-600 active:scale-95'
                }`}
                id="btn-theme-blue"
              >
                雾霾蓝
              </button>
              <button
                onClick={() => setTheme('sage_green')}
                className={`flex-1 sm:flex-initial text-center px-3.5 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                  theme === 'sage_green'
                    ? 'bg-[#8fa385] text-white border-[#8fa385] shadow-[0_2px_8px_rgba(143,163,133,0.2)]'
                    : 'bg-white border-[#e5e5e5] text-neutral-600 active:scale-95'
                }`}
                id="btn-theme-green"
              >
                浅豆绿
              </button>
              <button
                onClick={() => setTheme('gallery_white')}
                className={`flex-1 sm:flex-initial text-center px-3.5 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                  theme === 'gallery_white'
                    ? 'bg-neutral-850 text-white border-neutral-850 shadow-md'
                    : 'bg-white border-[#e5e5e5] text-neutral-600 active:scale-95'
                }`}
                id="btn-theme-white"
              >
                极简白
              </button>
            </div>
          </div>

          {/* 实时海报虚拟看板 (手机高度适配版) */}
          <div className={`p-4 sm:p-8 rounded-2xl transition-all duration-300 ${active.bg} flex justify-center items-center`} id="poster-frame-container">
            <div className={`w-full max-w-[270px] sm:max-w-[320px] aspect-[4/6] rounded-2xl shadow-xl ${active.cardBg} border border-dashed ${theme === 'gallery_white' ? 'border-neutral-200' : 'border-white'} p-5 sm:p-7 flex flex-col justify-between relative overscroll-none select-none`} id="poster-paper">
              {/* 美化边框框 */}
              <div className={`absolute inset-3 sm:inset-4 border rounded-xl pointer-events-none ${active.borderStyle}`} id="poster-border-decorator" />

              <div className="z-10 text-center" id="poster-top">
                <div role="img" aria-label="云序择名Logo" className={`text-[9px] sm:text-[10px] font-bold tracking-[5px] uppercase ${theme === 'gallery_white' ? 'text-black/80' : 'text-neutral-500'}`} id="poster-watermark">
                  云序择名
                </div>
                <div className="text-[7px] tracking-[1.5px] text-neutral-400 mt-0.5 uppercase" id="poster-watermark-en">
                  YUN XU ZE MING
                </div>
              </div>

              {/* 大字姓名区域 */}
              <div className="text-center z-10 flex flex-col items-center justify-center my-4 sm:my-5" id="poster-mid-name">
                {card.surname && (
                  <span className="text-base sm:text-lg text-neutral-400 font-light tracking-wide mb-1 block" id="poster-surname-tag">
                    {card.surname}
                  </span>
                )}
                <span className={`text-4xl sm:text-4.5xl font-extrabold tracking-widest ${active.textColor} pl-2 sm:pl-3`} id="poster-name-tag">
                  {card.name}
                </span>

                <div className={`mt-4 sm:mt-5 inline-block py-0.5 px-2.5 rounded-full text-[8.5px] font-bold tracking-wide ${active.labelStyle}`} id="poster-category">
                  {getSceneName()} · {getStylesString()}
                </div>
              </div>

              <div className="z-10 text-center flex flex-col gap-3" id="poster-bottom">
                <p className="text-[9.5px] sm:text-[10.5px] leading-relaxed text-neutral-600 font-sans tracking-wide px-1 line-clamp-4" id="poster-meaning">
                  {card.meaning}
                </p>

                {card.source && (
                  <div className="text-[8px] text-neutral-500 bg-neutral-50 py-0.5 px-2.5 border border-neutral-100 rounded self-center" id="poster-source">
                    典原：{card.source}
                  </div>
                )}

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-1" id="poster-decorative-footer">
                  <span className="w-0.5 h-0.5 rounded-full bg-neutral-300" />
                  <span className="text-[7.5px] text-neutral-400 tracking-[2px]" id="poster-footquote">
                    云生雅序 择优为名
                  </span>
                  <span className="w-0.5 h-0.5 rounded-full bg-neutral-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal 动作区 (高触压、全宽手机友好按钮) */}
        <div className="border-t border-neutral-100 p-4 px-5 bg-neutral-55 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0" id="poster-modal-actions">
          <button
            onClick={copyFormattedText}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-[#e5e5e5] rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-800 hover:border-neutral-300 active:scale-95 transition-all cursor-pointer"
            id="share-formatted-text-btn"
          >
            <Share2 className="w-4 h-4 text-neutral-500" />
            复制并分享精美文字
          </button>
          <button
            onClick={downloadSVG}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#6b8a9e] hover:bg-[#5c7c8c] text-white rounded-xl text-xs font-extrabold active:scale-95 transition-all shadow-[0_4px_12px_rgba(107,138,158,0.25)] cursor-pointer"
            id="download-svg-btn"
          >
            <Download className="w-4 h-4" />
            保存高清矢量图 (SVG)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
