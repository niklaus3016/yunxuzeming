/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 场景定义
export type SceneType =
  | 'baby_boy' // 宝宝男名
  | 'baby_girl' // 宝宝女名
  | 'daily_nickname' // 日常网名
  | 'game_nickname' // 游戏昵称
  | 'pen_art_name' // 笔名艺名
  | 'shop_brand_name'; // 商铺字号

export interface SceneOption {
  id: SceneType;
  name: string;
  description: string;
  placeholderSurname: string; // 默认推荐姓氏（如宝宝起名推荐汉姓，商铺等可以为空或可选）
}

// 风格标签定义
export type StyleType =
  | 'warm_elegant' // 温润清雅
  | 'minimal_cool' // 简约冷淡
  | 'energetic_lively' // 元气灵动
  | 'steady_majestic' // 沉稳大气
  | 'zen_pure' // 禅系素净
  | 'literary_academic'; // 文艺书卷

export interface StyleOption {
  id: StyleType;
  name: string;
  badgeColor: string; // 辅助色描述
}

// 生成的名字卡片
export interface NameCardType {
  id: string;
  name: string; // 纯名字（不含姓氏）
  surname: string; // 生成时的姓氏（若无则为空）
  scene: SceneType;
  styles: StyleType[];
  meaning: string; // 气韵释义
  source?: string; // 典籍出处（选填）
  originalCharDetails?: {
    char: string;
    pinyin: string;
    meaning: string;
  }[]; // 单字释义（可选，主要为增色，展示“清雅”品质）
  createdAt: number;
}

// 历史记录结构
export interface HistoryRecord {
  id: string;
  timestamp: number;
  config: {
    scene: SceneType;
    surname: string;
    length: 2 | 3 | 4;
    styles: StyleType[];
    includeChars: string;
    excludeChars: string;
  };
  generatedCards: NameCardType[];
}

// 高级筛选设置
export interface AdvancedFilter {
  includeChars: string; // 必须含字
  excludeChars: string; // 规避偏字、避字
}
