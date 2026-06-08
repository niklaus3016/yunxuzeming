/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Copy, Image as ImageIcon, Sparkles } from 'lucide-react';
import { NameCardType, StyleType } from '../types';
import { STYLE_OPTIONS, CHARACTERS_DB } from '../data';

interface NameCardProps {
  card: NameCardType;
  isCollected: boolean;
  onToggleCollect: () => void;
  onCopyToClipboard: () => void;
  onOpenPoster: () => void;
}

export function NameCard({
  card,
  isCollected,
  onToggleCollect,
  onCopyToClipboard,
  onOpenPoster,
}: NameCardProps) {
  // 查找风格信息
  const getStyleName = (styleId: StyleType) => {
    return STYLE_OPTIONS.find((s) => s.id === styleId)?.name || '精品风格';
  };

  const getStyleColor = (styleId: StyleType) => {
    return (
      STYLE_OPTIONS.find((s) => s.id === styleId)?.badgeColor ||
      'bg-neutral-50 text-neutral-600 border-neutral-100 hover:bg-neutral-100'
    );
  };

  // 生成每个字的拼音与拆解
  const nameChars = Array.from(card.name);
  const characterDetails = nameChars.map((char) => {
    const dbChar = CHARACTERS_DB.find((item) => item.char === char);
    return {
      char,
      pinyin: dbChar?.pinyin || '',
      meaning: dbChar?.meaning || '',
    };
  });

  // 获得姓氏拼音 (如果是特定姓)
  const getSurnamePinyin = (s: string) => {
    if (!s) return '';
    const map: Record<string, string> = {
      陆: 'lù', 苏: 'sū', 李: 'lǐ', 张: 'zhāng', 
      王: 'wáng', 刘: 'liú', 陈: 'chén', 杨: 'yáng', 赵: 'zhào', 
      黄: 'huáng', 周: 'zhōu', 吴: 'wú', 徐: 'xú', 孙: 'sūn', 
      马: 'mǎ', 胡: 'hú', 朱: 'zhū', 郭: 'guō', 何: 'hé', 
      高: 'gāo', 林: 'lín', 罗: 'luó', 诸葛: 'zhū gě', 欧阳: 'ōu yáng',
      司马: 'sī mǎ', 独孤: 'dú gū', 夏侯: 'xià hóu'
    };
    return map[s] || '';
  };

  return (
    <div
      className="bg-white border border-neutral-150 rounded-2.5xl p-5 sm:p-6 shadow-3xs hover:shadow-xs transition-all duration-300 flex flex-col justify-between h-full hover:border-neutral-300 select-none"
      id={`name-card-${card.id}`}
    >
      <div>
        {/* 卡片头部：风格标签 */}
        <div className="flex flex-wrap gap-1.5 mb-3.5" id={`card-styles-${card.id}`}>
          {card.styles.map((styleId, index) => (
            <span
              key={styleId || `style-${card.id}-${index}`}
              className={`text-[9.5px] px-2.5 py-1 rounded-full border font-bold ${getStyleColor(styleId)} transition-all`}
              id={`style-tag-${card.id}-${styleId}`}
            >
              #{getStyleName(styleId)}
            </span>
          ))}
        </div>

        {/* 名字大字展示区 (精美移动端大字高雅感) */}
        <div className="text-center py-5 border-b border-dashed border-neutral-100 relative" id={`card-name-section-${card.id}`}>
          
          <div className="flex justify-center items-end gap-0.5 mb-2.5 select-all" id={`card-full-name-${card.id}`}>
            {card.surname && (
              <span className="text-2.5xl sm:text-3xl text-neutral-400 font-light mr-0.5" id={`card-surname-${card.id}`}>
                {card.surname}
              </span>
            )}
            <span className="text-3xl sm:text-3.5xl text-neutral-800 font-black tracking-widest pl-1" id={`card-name-text-${card.id}`}>
              {card.name}
            </span>
          </div>

          {/* 拼音标音 */}
          <div className="inline-flex justify-center items-center gap-2.5 text-[9.5px] text-neutral-400 font-mono tracking-widest mt-1.5 bg-neutral-50 px-3 py-1 rounded-full" id={`card-pinyins-${card.id}`}>
            {card.surname && getSurnamePinyin(card.surname) && (
              <span className="opacity-60 font-medium" id={`card-surname-pinyin-${card.id}`}>
                {getSurnamePinyin(card.surname)}
              </span>
            )}
            {characterDetails.map((det, idx) => (
              <span className="font-extrabold text-neutral-550" key={idx} id={`card-char-pinyins-${card.id}-${idx}`}>
                {det.pinyin || '·'}
              </span>
            ))}
          </div>
        </div>

        {/* 气韵释义 */}
        <div className="mt-4 space-y-3.5" id={`card-details-${card.id}`}>
          <p className="text-xs text-neutral-650 leading-relaxed font-sans font-medium" id={`card-meaning-${card.id}`}>
            {card.meaning}
          </p>

          {card.source && (
            <div className="text-[9.5px] text-neutral-450 bg-[#8fa385]/6 text-[#6c8560] py-0.5 px-2.5 rounded-lg border border-[#8fa385]/10 inline-block font-bold" id={`card-source-${card.id}`}>
              典原：{card.source}
            </div>
          )}

          {/* 拆字解释 */}
          {characterDetails.some((d) => d.meaning) && (
            <div className="pt-2.5 border-t border-neutral-100" id={`card-split-section-${card.id}`}>
              <span className="text-[9px] font-black text-neutral-400 block mb-1.5 uppercase tracking-wider">【字义浅析】</span>
              <div className="space-y-1.5" id={`card-splits-${card.id}`}>
                {characterDetails.map(
                  (det, i) =>
                    det.meaning && (
                      <p className="text-[10.5px] text-neutral-500 leading-relaxed font-medium" key={i} id={`card-split-row-${card.id}-${i}`}>
                        <strong className="text-neutral-800 font-bold bg-neutral-100 px-1.5 py-0.5 rounded mr-1">
                          {det.char}
                        </strong>
                        <span className="text-[9px] text-neutral-400 font-mono mr-1">({det.pinyin})</span>：
                        {det.meaning.split('，')[0]}
                      </p>
                    )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 在智能小屏上拥有 44px 舒适指控触压的手柄控制条 */}
      <div className="mt-6 pt-3.5 border-t border-neutral-100 flex items-center justify-between gap-2 text-xs" id={`card-actions-${card.id}`}>
        <button
          onClick={onToggleCollect}
          className={`flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl border transition-all cursor-pointer active:scale-93 font-bold ${
            isCollected
              ? 'bg-[#8fa385] text-white border-[#8fa385] shadow-3xs'
              : 'border-[#e5e5e5] text-neutral-600 bg-white hover:bg-neutral-50 active:scale-93'
          }`}
          title={isCollected ? '取消收藏' : '添加收藏'}
          id={`card-collect-btn-${card.id}`}
        >
          {isCollected ? (
            <Heart className="w-4 h-4 fill-white text-white" />
          ) : (
            <Heart className="w-4 h-4" />
          )}
          <span>{isCollected ? '已收' : '收藏'}</span>
        </button>

        <button
          onClick={onCopyToClipboard}
          className="flex-1 h-9 flex items-center justify-center gap-1.5 border border-neutral-200 bg-white rounded-xl text-neutral-600 hover:text-neutral-800 hover:border-neutral-300 transition-all active:scale-93 cursor-pointer font-bold"
          title="复制名字及诗意解析"
          id={`card-copy-btn-${card.id}`}
        >
          <Copy className="w-4 h-4" />
          <span>复制</span>
        </button>

        <button
          onClick={onOpenPoster}
          className="flex-1 h-9 flex items-center justify-center gap-1.5 border border-neutral-200 bg-white rounded-xl text-neutral-600 hover:text-neutral-800 hover:border-neutral-300 transition-all active:scale-93 cursor-pointer font-bold"
          title="设计名字海报卡片"
          id={`card-poster-btn-${card.id}`}
        >
          <ImageIcon className="w-4 h-4 text-[#6b8a9e]" />
          <span>海报</span>
        </button>
      </div>
    </div>
  );
}
