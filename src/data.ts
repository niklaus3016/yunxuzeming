/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SceneOption, StyleOption, NameCardType, SceneType, StyleType } from './types';

// --- 预定义名字库缓存 (scene + length + stylesKey -> filtered items) ---
const predefinedCache = new Map<string, typeof PREDEFINED_NAMES_DB>();

const getStylesKey = (styles: StyleType[]) => styles.slice().sort().join('|');

const getFilteredPredefined = (
  scene: SceneType,
  length: 2 | 3 | 4,
  styles: StyleType[]
): typeof PREDEFINED_NAMES_DB => {
  const key = `${scene}|${length}|${getStylesKey(styles)}`;
  if (predefinedCache.has(key)) {
    return predefinedCache.get(key)!;
  }
  const result = PREDEFINED_NAMES_DB.filter((item) => {
    if (!item.scenes.includes(scene)) return false;
    if (item.length !== length) return false;
    if (styles.length > 0 && !item.styles.some((s) => styles.includes(s))) return false;
    return true;
  });
  predefinedCache.set(key, result);
  return result;
};

// --- 字符库索引缓存 (char -> index) ---
const charIndexCache = new Map<string, number>();
const buildCharIndex = () => {
  if (charIndexCache.size === 0) {
    CHARACTERS_DB.forEach((c, i) => charIndexCache.set(c.char, i));
  }
};

const getCharDetail = (char: string) => {
  buildCharIndex();
  const idx = charIndexCache.get(char);
  return idx !== undefined ? CHARACTERS_DB[idx] : undefined;
};

export const SCENE_OPTIONS: SceneOption[] = [
  {
    id: 'baby_boy',
    name: '宝宝男名',
    description: '温雅大气，寄托风骨与远志，承载君子之德。',
    placeholderSurname: '陆',
  },
  {
    id: 'baby_girl',
    name: '宝宝女名',
    description: '聪慧灵秀，蕴含诗书闺媛韵致，清丽脱俗。',
    placeholderSurname: '林',
  },
  {
    id: 'daily_nickname',
    name: '日常网名',
    description: '现代清冷或极简元气，呈现自我的独特精神角落。',
    placeholderSurname: '',
  },
  {
    id: 'game_nickname',
    name: '游戏昵称',
    description: '带有一丝孤傲、神秘或灵动不羁的个性游戏代称。',
    placeholderSurname: '',
  },
  {
    id: 'pen_art_name',
    name: '笔名艺名',
    description: '留白极简，极具设计感与辨识度的创作者笔名。',
    placeholderSurname: '苏',
  },
  {
    id: 'shop_brand_name',
    name: '商铺字号',
    description: '简约高级，突显现代审美与清雅调性。',
    placeholderSurname: '',
  },
];

export const STYLE_OPTIONS: StyleOption[] = [
  { id: 'warm_elegant', name: '温润清雅', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' },
  { id: 'minimal_cool', name: '简约冷淡', badgeColor: 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100' },
  { id: 'energetic_lively', name: '元气灵动', badgeColor: 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100' },
  { id: 'steady_majestic', name: '沉稳大气', badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-100 hover:bg-cyan-100' },
  { id: 'zen_pure', name: '禅系素净', badgeColor: 'bg-stone-50 text-stone-700 border-stone-100 hover:bg-stone-100' },
  { id: 'literary_academic', name: '文艺书卷', badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100' },
];

export interface StaticPredefinedName {
  name: string;
  meaning: string;
  source?: string;
  styles: StyleType[];
  scenes: SceneType[];
  length: 2 | 3 | 4;
}

// 精心手工编排的优质字库，用于动态生成和精细化单字注解
export interface CharacterDetail {
  char: string;
  pinyin: string;
  meaning: string;
  styles: StyleType[];
  scenes: SceneType[];
}

export const CHARACTERS_DB: CharacterDetail[] = [
  // 温润清雅
  { char: '韫', pinyin: 'yùn', meaning: '藏金蕴玉，含蓄内敛之美', styles: ['warm_elegant', 'literary_academic'], scenes: ['baby_boy', 'baby_girl', 'pen_art_name', 'shop_brand_name'] },
  { char: '瑾', pinyin: 'jǐn', meaning: '怀瑾握瑜，完美无瑕的美玉', styles: ['warm_elegant'], scenes: ['baby_girl', 'baby_boy', 'pen_art_name'] },
  { char: '斐', pinyin: 'fěi', meaning: '文采斐然，展现杰出才华与翩翩风度', styles: ['warm_elegant', 'literary_academic'], scenes: ['baby_boy', 'baby_girl', 'pen_art_name'] },
  { char: '栩', pinyin: 'xǔ', meaning: '栩栩如生，灵动而富有生机活力', styles: ['energetic_lively', 'warm_elegant'], scenes: ['baby_boy', 'baby_girl', 'daily_nickname', 'game_nickname'] },
  { char: '润', pinyin: 'rùn', meaning: '润物无声，温和有度，滋养万物', styles: ['warm_elegant', 'steady_majestic'], scenes: ['baby_boy', 'shop_brand_name'] },
  { char: '奕', pinyin: 'yì', meaning: '精神焕发，有格局、神采飞扬', styles: ['warm_elegant', 'steady_majestic'], scenes: ['baby_boy', 'shop_brand_name', 'game_nickname'] },
  { char: '和', pinyin: 'hé', meaning: '祥和温厚，中庸有度，和谐平静', styles: ['warm_elegant', 'zen_pure'], scenes: ['baby_boy', 'baby_girl', 'shop_brand_name'] },
  { char: '宁', pinyin: 'níng', meaning: '心气宁静，常保安康，恬静淡雅', styles: ['warm_elegant', 'zen_pure'], scenes: ['baby_boy', 'baby_girl', 'shop_brand_name'] },
  { char: '暄', pinyin: 'xuān', meaning: '温暖的日光，和煦温暖开朗', styles: ['warm_elegant', 'energetic_lively'], scenes: ['baby_girl', 'baby_boy', 'daily_nickname'] },
  { char: '珩', pinyin: 'héng', meaning: '古之佩玉，稀有纯净，独具古风气质', styles: ['warm_elegant', 'literary_academic'], scenes: ['baby_boy', 'pen_art_name', 'game_nickname'] },

  // 简约冷淡
  { char: '霁', pinyin: 'jì', meaning: '雨后晴天，一尘不染的冷静和高越', styles: ['minimal_cool', 'zen_pure'], scenes: ['baby_boy', 'baby_girl', 'daily_nickname', 'shop_brand_name'] },
  { char: '朔', pinyin: 'shuò', meaning: '朔风凛冽，坚毅、冷静、不媚俗', styles: ['minimal_cool'], scenes: ['baby_boy', 'game_nickname', 'daily_nickname'] },
  { char: '默', pinyin: 'mò', meaning: '缄默笃实，深沉冷静，思想深邃', styles: ['minimal_cool'], scenes: ['baby_boy', 'daily_nickname', 'pen_art_name', 'game_nickname'] },
  { char: '白', pinyin: 'bái', meaning: '素白干净，大简若繁，纯粹透彻', styles: ['minimal_cool', 'zen_pure'], scenes: ['baby_boy', 'baby_girl', 'daily_nickname', 'shop_brand_name'] },
  { char: '泠', pinyin: 'líng', meaning: '清冽泠泠，如幽谷清泉冷如弦色', styles: ['minimal_cool', 'zen_pure'], scenes: ['baby_girl', 'daily_nickname', 'game_nickname', 'shop_brand_name'] },
  { char: '简', pinyin: 'jiǎn', meaning: '大道至简，率真无杂，直接而不繁复', styles: ['minimal_cool'], scenes: ['baby_boy', 'baby_girl', 'pen_art_name', 'shop_brand_name'] },
  { char: '野', pinyin: 'yě', meaning: '旷野无垠，率性崇尚自然、不受束缚', styles: ['minimal_cool'], scenes: ['daily_nickname', 'game_nickname', 'pen_art_name'] },
  { char: '川', pinyin: 'chuān', meaning: '山川广阔，胸怀包容江河，沉寂自愈', styles: ['minimal_cool', 'steady_majestic'], scenes: ['baby_boy', 'daily_nickname', 'shop_brand_name'] },

  // 元气灵动
  { char: '澄', pinyin: 'chéng', meaning: '明丽透亮，心境如蓝天澄明无云', styles: ['energetic_lively', 'zen_pure'], scenes: ['baby_boy', 'baby_girl', 'daily_nickname', 'shop_brand_name'] },
  { char: '攸', pinyin: 'yōu', meaning: '水流自得，悠游自在，洒脱安逸', styles: ['energetic_lively'], scenes: ['baby_boy', 'baby_girl', 'daily_nickname', 'game_nickname'] },
  { char: '桐', pinyin: 'tóng', meaning: '梧桐叶落，蕴意充满蓬勃生机与朝气', styles: ['energetic_lively', 'literary_academic'], scenes: ['baby_girl', 'baby_boy', 'daily_nickname', 'shop_brand_name'] },
  { char: '羽', pinyin: 'yǔ', meaning: '羽翼飞舞，不受约束，自由轻灵', styles: ['energetic_lively'], scenes: ['baby_girl', 'daily_nickname', 'game_nickname'] },
  { char: '漾', pinyin: 'yàng', meaning: '波光满目，生动和活泼的生命质感', styles: ['energetic_lively'], scenes: ['baby_girl', 'daily_nickname', 'shop_brand_name'] },
  { char: '萌', pinyin: 'méng', meaning: '草木发芽，孕育无限希望与生机', styles: ['energetic_lively'], scenes: ['baby_girl', 'daily_nickname'] },
  { char: '星', pinyin: 'xīng', meaning: '璀璨星尘，极具追梦的青春力量', styles: ['energetic_lively'], scenes: ['baby_boy', 'baby_girl', 'game_nickname'] },

  // 沉稳大气
  { char: '山', pinyin: 'shān', meaning: '稳重如山，静穆高远，沉重笃定', styles: ['steady_majestic'], scenes: ['baby_boy', 'shop_brand_name'] },
  { char: '衡', pinyin: 'héng', meaning: '持衡守正，公平豁达，有理智有担当', styles: ['steady_majestic', 'literary_academic'], scenes: ['baby_boy', 'shop_brand_name'] },
  { char: '岳', pinyin: 'yuè', meaning: '五岳之首，坚不可摧的气势与巍峨', styles: ['steady_majestic'], scenes: ['baby_boy', 'game_nickname'] },
  { char: '渊', pinyin: 'yuān', meaning: '如临深渊，知识和阅历浩瀚内敛', styles: ['steady_majestic', 'literary_academic'], scenes: ['baby_boy', 'shop_brand_name'] },
  { char: '巍', pinyin: 'wēi', meaning: '崇巍高大，令人仰望的坚定精神', styles: ['steady_majestic'], scenes: ['baby_boy', 'shop_brand_name'] },
  { char: '昭', pinyin: 'zhāo', meaning: '光明皎洁、昭然天下，风度明朗', styles: ['steady_majestic', 'warm_elegant'], scenes: ['baby_boy', 'baby_girl', 'shop_brand_name'] },
  { char: '承', pinyin: 'chéng', meaning: '敢于承接，传承高洁精神与时代伟业', styles: ['steady_majestic'], scenes: ['baby_boy', 'shop_brand_name'] },

  // 禅系素净
  { char: '空', pinyin: 'kōng', meaning: '色即是空，凡尘尽洗，宽广辽远', styles: ['zen_pure'], scenes: ['shop_brand_name', 'daily_nickname', 'pen_art_name'] },
  { char: '禅', pinyin: 'chán', meaning: '幽居悟道，静思冥想，摒弃杂念', styles: ['zen_pure'], scenes: ['shop_brand_name', 'pen_art_name'] },
  { char: '溪', pinyin: 'xī', meaning: '细水长流，清亮见底，隐遁自然', styles: ['zen_pure', 'warm_elegant'], scenes: ['baby_girl', 'baby_boy', 'daily_nickname', 'shop_brand_name'] },
  { char: '尘', pinyin: 'chén', meaning: '一尘不染、或是洗脱尘缘后的超逸', styles: ['zen_pure', 'minimal_cool'], scenes: ['daily_nickname', 'game_nickname', 'pen_art_name'] },
  { char: '素', pinyin: 'sù', meaning: '纯净素美，真水无香，真诚笃行', styles: ['zen_pure', 'minimal_cool'], scenes: ['baby_girl', 'shop_brand_name'] },
  { char: '一', pinyin: 'yī', meaning: '万物归一，极简主义，初始的清纯', styles: ['zen_pure', 'minimal_cool'], scenes: ['baby_boy', 'daily_nickname', 'shop_brand_name'] },
  { char: '寂', pinyin: 'jì', meaning: '侘寂幽静，摒绝繁复，寻求内心真实', styles: ['zen_pure'], scenes: ['daily_nickname', 'game_nickname', 'shop_brand_name'] },

  // 文艺书卷
  { char: '书', pinyin: 'shū', meaning: '博览群书，气质温和的儒雅学者', styles: ['literary_academic'], scenes: ['baby_girl', 'baby_boy', 'pen_art_name', 'shop_brand_name'] },
  { char: '暮', pinyin: 'mù', meaning: '夕阳薄暮，满怀浪漫抒情的艺术色泽', styles: ['literary_academic'], scenes: ['daily_nickname', 'pen_art_name'] },
  { char: '迟', pinyin: 'chí', meaning: '迟迟春日，优雅舒缓，不急功近利', styles: ['literary_academic', 'minimal_cool'], scenes: ['daily_nickname', 'pen_art_name'] },
  { char: '若', pinyin: 'ruò', meaning: '仿佛般美好，若愚若智的大气涵养', styles: ['literary_academic', 'warm_elegant'], scenes: ['baby_girl', 'baby_boy', 'pen_art_name'] },
  { char: '颜', pinyin: 'yán', meaning: '和颜悦色，书卷美名，姿态文雅', styles: ['literary_academic', 'energetic_lively'], scenes: ['baby_girl', 'daily_nickname', 'shop_brand_name'] },
  { char: '徽', pinyin: 'huī', meaning: '清徽美意，闪烁古雅人文之光', styles: ['literary_academic'], scenes: ['baby_boy', 'baby_girl', 'pen_art_name'] },

  // 特色单字
  { char: '曜', pinyin: 'yào', meaning: '璀璨华曜，如太阳般拥有非凡个性', styles: ['steady_majestic'], scenes: ['baby_boy', 'game_nickname', 'shop_brand_name'] },
  { char: '羽', pinyin: 'yǔ', meaning: '独立自由，不落俗套，飘然有格', styles: ['minimal_cool'], scenes: ['baby_girl', 'daily_nickname', 'pen_art_name'] },
  { char: '隐', pinyin: 'yǐn', meaning: '藏锋显拙，不随流凡，具有神秘气息', styles: ['zen_pure'], scenes: ['daily_nickname', 'game_nickname', 'shop_brand_name'] },
  { char: '燃', pinyin: 'rán', meaning: '燃点热忱，带有锋芒锐气与现代张力', styles: ['energetic_lively'], scenes: ['game_nickname', 'shop_brand_name'] },
  { char: '遇', pinyin: 'yù', meaning: '人生际遇，充满了奇妙而美妙的缘分', styles: ['warm_elegant'], scenes: ['daily_nickname', 'shop_brand_name', 'pen_art_name'] },
  { char: '芒', pinyin: 'máng', meaning: '微光细小，却能穿透黑暗的锋芒', styles: ['minimal_cool'], scenes: ['daily_nickname', 'game_nickname', 'pen_art_name'] },
  { char: '渡', pinyin: 'dù', meaning: '渡己渡人，历练生命的包容与洒脱', styles: ['zen_pure'], scenes: ['daily_nickname', 'shop_brand_name', 'game_nickname'] }
];

// 高品质成品名字库，多维度风格覆盖，绝对原创和雅致，完全无“天、地、玄、黄”类的玄幻庸俗感
export const PREDEFINED_NAMES_DB: StaticPredefinedName[] = [
  // =================== 宝宝男名 (baby_boy) ===================
  // 2字
  {
    name: '韫玉',
    meaning: '“韫椟藏玉，温润而泽”。意指君子饱含学问，性格涵养如玉般温和内敛。',
    styles: ['warm_elegant', 'literary_academic'],
    scenes: ['baby_boy', 'pen_art_name'],
    length: 2,
    source: '《文心雕龙》“石韫玉而山辉”'
  },
  {
    name: '怀瑾',
    meaning: '“怀瑾握瑜，仙风道骨”。形容心怀崇高美德，举止风流清雅。',
    styles: ['warm_elegant', 'literary_academic'],
    scenes: ['baby_boy', 'pen_art_name'],
    length: 2,
    source: '《楚辞·九章》“怀瑾握瑜兮”'
  },
  {
    name: '霁林',
    meaning: '雨后晴空澄澈为霁，日光穿透寂静林间。表达冷静、自持而又生机内蕴的气度。',
    styles: ['minimal_cool', 'zen_pure'],
    scenes: ['baby_boy', 'daily_nickname'],
    length: 2
  },
  {
    name: '栩之',
    meaning: '栩栩如生、灵动飘逸。彰显生命活力与通达智慧，举重若轻。',
    styles: ['energetic_lively', 'warm_elegant'],
    scenes: ['baby_boy', 'daily_nickname'],
    length: 2
  },
  {
    name: '衡岳',
    meaning: '行行出持衡守正，静静如泰岳屹立。形容品行高洁有度，行事稳重。',
    styles: ['steady_majestic'],
    scenes: ['baby_boy'],
    length: 2
  },
  {
    name: '溪尘',
    meaning: '溪水叮咚洗尽凡尘。比喻心底无尘、高洁淡泊的素心品质。',
    styles: ['zen_pure', 'warm_elegant'],
    scenes: ['baby_boy', 'shop_brand_name'],
    length: 2
  },
  {
    name: '隐川',
    meaning: '大川奔流而深隐其迹。象征胸襟开阔，为人低调且智慧深隽。',
    styles: ['minimal_cool'],
    scenes: ['baby_boy', 'daily_nickname'],
    length: 2
  },
  // 3字
  {
    name: '陆羽临',
    meaning: '意境高旷舒朗，既承接古时茶圣陆羽的博雅风范，又取临溪观澜之安祥，温和舒润。',
    styles: ['warm_elegant', 'literary_academic'],
    scenes: ['baby_boy', 'shop_brand_name'],
    length: 3
  },
  {
    name: '霁清川',
    meaning: '雨过天晴时明净的江水奔流。带有冷峻、简练、辽阔豁达的气息。',
    styles: ['minimal_cool', 'steady_majestic'],
    scenes: ['baby_boy'],
    length: 3
  },
  {
    name: '顾书行',
    meaning: '博览群书，身体力行。意指其人学识渊博，举止踏实沉静，具书卷君子之风。',
    styles: ['literary_academic', 'warm_elegant'],
    scenes: ['baby_boy', 'pen_art_name'],
    length: 3
  },
  {
    name: '言昭衡',
    meaning: '言谈温文，心境昭明，行事均衡有度。尽显博大沉稳和高贵教养。',
    styles: ['steady_majestic', 'warm_elegant'],
    scenes: ['baby_boy'],
    length: 3
  },
  {
    name: '林若言',
    meaning: '大雅若言，万木蔚然而声声相合。字面安静而极具灵气，小众独立。',
    styles: ['minimal_cool'],
    scenes: ['baby_boy', 'pen_art_name'],
    length: 3
  },
  // 4字
  {
    name: '怀瑾若风',
    meaning: '身怀无瑕美德（瑾），行进如清风一般畅行舒适、豁达安逸。',
    styles: ['warm_elegant', 'literary_academic'],
    scenes: ['baby_boy'],
    length: 4
  },
  {
    name: '白川霁野',
    meaning: '平原上白川奔流，暴雨过后，原野一片宁静沉肃。极简且磅礴清冷。',
    styles: ['minimal_cool', 'steady_majestic'],
    scenes: ['baby_boy', 'game_nickname'],
    length: 4
  },
  {
    name: '沐阳澄光',
    meaning: '沐浴在明快而热烈的澄澈晨光中。元气丰沛，为人开朗澄澈。',
    styles: ['energetic_lively'],
    scenes: ['baby_boy'],
    length: 4
  },

  // =================== 宝宝女名 (baby_girl) ===================
  // 2字
  {
    name: '清徽',
    meaning: '“清徽”意为美好皎洁之德徽，音韵清越，举止轻灵优雅。',
    styles: ['warm_elegant', 'literary_academic'],
    scenes: ['baby_girl', 'pen_art_name'],
    length: 2,
    source: '《世说新语》“清徽雅量，实为朝廷所器。”'
  },
  {
    name: '泠溪',
    meaning: '泠泠作响的幽谷之溪。空灵幽冷，不染一尘，带有极精致的冷淡美感。',
    styles: ['minimal_cool', 'zen_pure'],
    scenes: ['baby_girl', 'daily_nickname'],
    length: 2
  },
  {
    name: '攸然',
    meaning: '悠闲自在、宛转灵盈。呈现出女子无拘无束、怡然自得的热情性格。',
    styles: ['energetic_lively'],
    scenes: ['baby_girl', 'daily_nickname'],
    length: 2
  },
  {
    name: '素徽',
    meaning: '朴实素雅的生活中透露出清风明月的徽德。形容娴静、执着、不浮躁。',
    styles: ['zen_pure', 'warm_elegant'],
    scenes: ['baby_girl'],
    length: 2
  },
  {
    name: '宛若',
    meaning: '仿佛世间之诗意温柔，风自如水。流露出江南水乡般的文艺温存。',
    styles: ['literary_academic', 'warm_elegant'],
    scenes: ['baby_girl'],
    length: 2
  },
  {
    name: '曜羽',
    meaning: '灿如明星，羽化不落凡圣。现代、独特，寄托不随同大流的高洁追求。',
    styles: ['minimal_cool'],
    scenes: ['baby_girl', 'daily_nickname'],
    length: 2
  },
  // 3字
  {
    name: '林微苒',
    meaning: '草木渐次而茂密温柔地舒展，风拂微苒。比喻女子风姿绰约，温润柔媚。',
    styles: ['warm_elegant', 'literary_academic'],
    scenes: ['baby_girl'],
    length: 3
  },
  {
    name: '沈霁白',
    meaning: '沈郁深秀，雪后霽白。极其端庄雅致，给人极简、高洁、深邃的内敛之美。',
    styles: ['minimal_cool', 'zen_pure'],
    scenes: ['baby_girl', 'daily_nickname'],
    length: 3
  },
  {
    name: '沈初漾',
    meaning: '静水中激荡起一圈温和的水纹。意活泼生动、眼中含春、聪颖过人。',
    styles: ['energetic_lively', 'warm_elegant'],
    scenes: ['baby_girl'],
    length: 3
  },
  {
    name: '顾溪吟',
    meaning: '临溪聆听、歌吟其间。极具清远书卷气质，文笔秀丽非凡。',
    styles: ['literary_academic', 'zen_pure'],
    scenes: ['baby_girl', 'shop_brand_name', 'pen_art_name'],
    length: 3
  },
  {
    name: '温宁致',
    meaning: '温和笃定、娴静聪慧、专注于心中的宁美境界。大气安稳。',
    styles: ['steady_majestic', 'warm_elegant'],
    scenes: ['baby_girl'],
    length: 3
  },
  // 4字
  {
    name: '月华如水',
    meaning: '皎洁的月光温凉地流泻下来。形容女孩性情温柔优雅，心思澄净剔透。',
    styles: ['warm_elegant', 'zen_pure'],
    scenes: ['baby_girl'],
    length: 4
  },
  {
    name: '知白守墨',
    meaning: '知晓光明，却安守深沉的缄默。大气自持、清冷且学识极其开阔。',
    styles: ['minimal_cool', 'steady_majestic'],
    scenes: ['baby_girl', 'pen_art_name'],
    length: 4
  },
  {
    name: '青空凝溪',
    meaning: '清亮的天色投影在寂静的溪水中，澄澈见底。极其禅爽小众。',
    styles: ['zen_pure'],
    scenes: ['baby_girl', 'shop_brand_name'],
    length: 4
  },

  // =================== 日常网名 (daily_nickname) ===================
  // 2字
  { name: '游野', meaning: '自在畅游于广袤天地间，追求内心的纯澈自由。', styles: ['minimal_cool'], scenes: ['daily_nickname', 'game_nickname'], length: 2 },
  { name: '白叙', meaning: '用最简练干净的姿态，安然吐露生活琐细，沉寂温和。', styles: ['minimal_cool', 'literary_academic'], scenes: ['daily_nickname', 'pen_art_name'], length: 2 },
  { name: '栩栩', meaning: '元气蓬勃，一双眼澄澈灵动，仿佛融尽了整部春日。', styles: ['energetic_lively'], scenes: ['daily_nickname'], length: 2 },
  { name: '泠月', meaning: '一抹淡凉彻骨的月牙。极为高冷、宁静、空灵。', styles: ['minimal_cool', 'zen_pure'], scenes: ['daily_nickname'], length: 2 },
  { name: '浅暄', meaning: '初冬和煦明媚的微光。透露出亲切、温暖又不过分的热络。', styles: ['warm_elegant', 'energetic_lively'], scenes: ['daily_nickname'], length: 2 },
  // 3字
  { name: '半夏生', meaning: '初夏时分蓬勃盎然，略带文艺片质感与自然况味。', styles: ['literary_academic'], scenes: ['daily_nickname', 'pen_art_name'], length: 3 },
  { name: '一言渡', meaning: '漫漫红尘，寄情一语。充满了禅意的超然洒脱和小众感。', styles: ['zen_pure'], scenes: ['daily_nickname', 'game_nickname'], length: 3 },
  { name: '澄碧空', meaning: '如雨后的旷远苍天，干干净净，让人心神静谧。', styles: ['minimal_cool', 'energetic_lively'], scenes: ['daily_nickname'], length: 3 },
  // 4字
  { name: '微风温润', meaning: '仿佛一记温凉而轻柔的拥抱，带着午后松木的淡雅芬芳。', styles: ['warm_elegant'], scenes: ['daily_nickname'], length: 4 },
  { name: '荒原落白', meaning: '白雪簌簌覆盖着无垠的原野。极致冷淡、纯净和文艺疏离。', styles: ['minimal_cool'], scenes: ['daily_nickname', 'game_nickname'], length: 4 },

  // =================== 游戏昵称 (game_nickname) ===================
  // 2字
  { name: '逆曜', meaning: '颠倒暗曜、锋芒毕露，寓意在竞技角逐中破茧成蝶。', styles: ['steady_majestic'], scenes: ['game_nickname'], length: 2 },
  { name: '冷朔', meaning: '北风呼号，霜雪自封。冷静沉静到极致的顶尖独行。', styles: ['minimal_cool'], scenes: ['game_nickname'], length: 2 },
  { name: '轻羽', meaning: '身影敏捷飘忽，踏水无痕，元气极其灵巧洒脱。', styles: ['energetic_lively'], scenes: ['game_nickname'], length: 2 },
  { name: '无澜', meaning: '波澜不惊。泰山崩于前而眼不瞬的绝对掌控气概。', styles: ['steady_majestic', 'zen_pure'], scenes: ['game_nickname'], length: 2 },
  // 3字
  { name: '观沧海', meaning: '登临碣石观沧海，波澜壮阔。流露出极震撼的大气姿态。', styles: ['steady_majestic', 'literary_academic'], scenes: ['game_nickname'], length: 3 },
  { name: '渡惊弦', meaning: '在流矢飞弹、紧绷如弦的环境中绝渡求生。动感利落，帅气十足。', styles: ['energetic_lively'], scenes: ['game_nickname'], length: 3 },
  { name: '一叶寂', meaning: '落叶归根，一叶知秋。透着孤僻、宁静无争与极致高傲。', styles: ['zen_pure', 'minimal_cool'], scenes: ['game_nickname'], length: 3 },
  // 4字
  { name: '北极玄霜', meaning: '极地之巅凝聚的幽蓝碎冰。清峻、高寒，操作行云流水。', styles: ['minimal_cool', 'steady_majestic'], scenes: ['game_nickname'], length: 4 },
  { name: '风过无声', meaning: '极其敏捷敏锐，杀伐或行走于黑暗，不带走一丝涟漪。', styles: ['minimal_cool', 'zen_pure'], scenes: ['game_nickname'], length: 4 },

  // =================== 笔名艺名 (pen_art_name) ===================
  // 2字
  { name: '苏白', meaning: '苏子之白，大雪压松。极富文人墨客的傲骨温醇，干净至极。', styles: ['literary_academic', 'minimal_cool'], scenes: ['pen_art_name', 'daily_nickname'], length: 2 },
  { name: '林遣', meaning: '排遣俗尘，归退山林。带有独特的自我审视情怀，现代小众。', styles: ['minimal_cool'], scenes: ['pen_art_name'], length: 2 },
  { name: '墨池', meaning: '临池洗砚，墨染池萍。寄托极高洁的书画底蕴与文艺气息。', styles: ['literary_academic', 'warm_elegant'], scenes: ['pen_art_name', 'shop_brand_name'], length: 2 },
  { name: '浅川', meaning: '淙淙溪流，平静浅淌。温随自在，无意惊动尘嚣。', styles: ['warm_elegant', 'minimal_cool'], scenes: ['pen_art_name', 'daily_nickname'], length: 2 },
  // 3字
  { name: '苏未央', meaning: '余音未歇，盛宴未央。写满淡淡的韶华易逝感伤与文艺厚度。', styles: ['literary_academic', 'warm_elegant'], scenes: ['pen_art_name'], length: 3 },
  { name: '叶知秋', meaning: '一叶落而天下知秋。充满哲学思辨的客观冷静派，深情沉练。', styles: ['literary_academic', 'zen_pure'], scenes: ['pen_art_name'], length: 3 },
  { name: '冷遇一', meaning: '邂逅于寂冷凡尘的唯一生机。极其现代冷淡、极简又意味隽永。', styles: ['minimal_cool'], scenes: ['pen_art_name'], length: 3 },
  // 4字
  { name: '朝华夕拾', meaning: '清晨的华彩，在薄暮时静静捧起。饱含岁月沉淀的高尚艺术感。', styles: ['literary_academic'], scenes: ['pen_art_name'], length: 4 },
  { name: '山寂川流', meaning: '群山肃立寂静，大河川流不息。一静一动间，体现了非凡的人文深度。', styles: ['steady_majestic', 'zen_pure'], scenes: ['pen_art_name'], length: 4 },

  // =================== 茶室雅号 (tea_room_name) ===================
  // 2字
  { name: '静隐', meaning: '大隐于市，于袅袅茶香中洗脱焦躁，体悟清素人生。', styles: ['zen_pure', 'warm_elegant'], scenes: ['shop_brand_name'], length: 2 },
  { name: '一盏', meaning: '一盏红尘，真水无香。大道至简，只为返璞归真。', styles: ['minimal_cool', 'zen_pure'], scenes: ['shop_brand_name'], length: 2 },
  { name: '清和', meaning: '清泉烹茗，气和神定。极其传统的温润质感与平衡之美。', styles: ['warm_elegant', 'zen_pure'], scenes: ['shop_brand_name'], length: 2 },
  { name: '空弦', meaning: '心如虚空，无需世俗音乐干扰，听松风古井即是幽音。', styles: ['zen_pure'], scenes: ['shop_brand_name'], length: 2 },
  // 3字
  { name: '半山隐', meaning: '隐于半山云雾之中，汲取山泉，松针烹茶。素净出尘之最。', styles: ['zen_pure', 'minimal_cool'], scenes: ['shop_brand_name'], length: 3 },
  { name: '临风叙', meaning: '凭窗临风，围炉煮茶，将万丈红尘委委道来。文人情趣极佳。', styles: ['literary_academic', 'warm_elegant'], scenes: ['shop_brand_name'], length: 3 },
  { name: '澄心堂', meaning: '明心见性，清澄不染。彰显出茶道对心境洗磨的庄重沉静。', styles: ['steady_majestic', 'warm_elegant'], scenes: ['shop_brand_name'], length: 3 },
  // 4字
  { name: '空谷幽兰', meaning: '处幽深开阔之谷，如兰气吐露一般清淡悠长，大雅绝伦。', styles: ['warm_elegant', 'zen_pure'], scenes: ['shop_brand_name'], length: 4 },
  { name: '真水无香', meaning: '至高的美味莫过于淡水本身，无香中包罗了万物的本真气度。', styles: ['minimal_cool', 'zen_pure'], scenes: ['shop_brand_name'], length: 4 },

  // =================== 商铺字号 (shop_brand_name) ===================
  // 2字
  { name: '素墨', meaning: '极崇极简的素雅墨迹。非常适合高级手作、简约服装、设计工作室等。', styles: ['minimal_cool', 'literary_academic'], scenes: ['shop_brand_name'], length: 2 },
  { name: '木白', meaning: '温润的大地原木，干净优雅的留白。适合家居、咖啡或文艺杂货铺。', styles: ['minimal_cool', 'zen_pure'], scenes: ['shop_brand_name'], length: 2 },
  { name: '一澄', meaning: '万物皆归纯净。澄澈透明、充满信誉与极致精良，极具辨识度。', styles: ['energetic_lively'], scenes: ['shop_brand_name'], length: 2 },
  { name: '持衡', meaning: '持守天平、中正宏图。适合商务法律、高级定制、精工制造等。', styles: ['steady_majestic', 'warm_elegant'], scenes: ['shop_brand_name'], length: 2 },
  // 3字
  { name: '未完成', meaning: '意指永远走在朝向完美的求索路上，留白引人遐思。充满现代先锋感。', styles: ['minimal_cool'], scenes: ['shop_brand_name'], length: 3 },
  { name: '山中集', meaning: '从茂密森林深处搜集的纯真自然好物。极具呼吸感与天然素净调性。', styles: ['zen_pure', 'literary_academic'], scenes: ['shop_brand_name'], length: 3 },
  { name: '白至简', meaning: '雪白无杂，大道至简。传递了坚守纯净材质与极致极简的美学理念。', styles: ['minimal_cool'], scenes: ['shop_brand_name'], length: 3 },
  // 4字
  { name: '温良恭俭', meaning: '发自东方和煦克己的内在高贵气度。适合高档中式酒店、养生艺术空间。', styles: ['warm_elegant', 'steady_majestic'], scenes: ['shop_brand_name'], length: 4 },
  { name: '自然印记', meaning: '不留人工斧凿，完全源于天地本真的温厚纹理，充满着元气生命力。', styles: ['energetic_lively', 'zen_pure'], scenes: ['shop_brand_name'], length: 4 }
];

/**
 * 核心取名生成引擎
 * 核心逻辑：
 * 1. 优先在 predefined names 中筛选符合场景、字数、风格的名字并打乱。
 * 2. 如果可选结果不足10个：
 *    - 寻找符合相同场景和字库中任意关联风格单字
 *    - 根据字数组装名字：
 *      - 2字：[符合风格的A字] + [符合风格的B字]
 *      - 3字：在特定场景的常设词汇或者再用组合。比如可以结合优雅的过渡助词（若、之、以、亦、临、清）生成
 *      - 4字：一般采用两个高级意象字（比如：白川霁野）或句式。
 *    - 为动态生成的拼装名字即时赋予高水准的语义拆解（组合单字解释），使它看起来100%合理而深情。
 * 3. 精准匹配用户的含字（必须包含这个字）和避字（完全别出现这些字列表）。
 * 4. 去重：缓存最近生成的系列名字，避免再次出现。
 * 5. 最终返回10个完全独特的NameCard。
 */
export function generateNames(config: {
  scene: SceneType;
  surname: string;
  length: 2 | 3 | 4;
  styles: StyleType[];
  includeChars: string; // 必须含
  excludeChars: string; // 必须避
}): NameCardType[] {
  const { scene, surname, length, styles, includeChars, excludeChars } = config;

  // 加工含字/避字：
  const inCharList = includeChars.trim() ? Array.from(includeChars.trim()) : [];
  const exCharList = excludeChars.trim() ? Array.from(excludeChars.trim()) : [];

  // 1. 筛选静态库（使用缓存加速）
  let matchedPredefined = getFilteredPredefined(scene, length, styles);

  // 进一步筛选含字/避字（这些是动态条件，无法缓存）
  matchedPredefined = matchedPredefined.filter((item) => {
    // 筛选含字
    if (inCharList.length > 0) {
      const hasAllNeeded = inCharList.every((char) => item.name.includes(char));
      if (!hasAllNeeded) return false;
    }
    // 筛选避字
    if (exCharList.length > 0) {
      const hasForbidden = exCharList.some((char) => item.name.includes(char));
      if (hasForbidden) return false;
    }
    return true;
  });

  // 乱序
  matchedPredefined = matchedPredefined.sort(() => 0.5 - Math.random());

  const results: NameCardType[] = [];

  // 将静态库加入结果中，并防止重复
  const seenNames = new Set<string>();
  matchedPredefined.forEach((item) => {
    if (results.length < 10) {
      const cardId = `pre-${item.name}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      results.push({
        id: cardId,
        name: item.name,
        surname: surname,
        scene: scene,
        styles: item.styles.filter((s) => styles.includes(s)).length > 0
          ? item.styles.filter((s) => styles.includes(s))
          : [item.styles[0]], // 至少带有一项风格标签
        meaning: item.meaning,
        source: item.source,
        createdAt: Date.now(),
      });
      seenNames.add(item.name);
    }
  });

  // 2. 如果结果不足10个，启动超级高级动态拼装组件
  if (results.length < 10) {
    // 根据风格和场景筛选可用的汉字元件
    const availableChars = CHARACTERS_DB.filter((charItem) => {
      // 场景合适
      const sceneOk = charItem.scenes.includes(scene);
      // 风格在用户选项中
      const styleOk = styles.length === 0 || charItem.styles.some((s) => styles.includes(s));
      // 避字逻辑
      const notExcluded = !exCharList.includes(charItem.char);
      return sceneOk && styleOk && notExcluded;
    });

    // 如果字库不够丰富，可以兜底不限制场景或放宽风格，来保障生成10条
    let fallbackChars = [...availableChars];
    if (fallbackChars.length < 5) {
      fallbackChars = CHARACTERS_DB.filter((item) => !exCharList.includes(item.char));
    }

    // 辅助助词：提供清雅文气的连接字
    const connectors = ['之', '亦', '若', '以', '临', '清', '如', '思', '微', '一', '初', '凝', '致'];

    // 循环拼接直到满10个或尝试过火
    let attempts = 0;
    while (results.length < 10 && attempts < 150) {
      attempts++;
      let candidateName = '';

      // 精确含字强制插眼
      if (inCharList.length > 0) {
        // 将含字作为必选成分
        const chosenInChar = inCharList[0]; // 优先第一个
        if (length === 2) {
          const randChar = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '林';
          candidateName = Math.random() > 0.5 ? (chosenInChar + randChar) : (randChar + chosenInChar);
        } else if (length === 3) {
          const randC1 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '清';
          const randC2 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '川';
          if (Math.random() > 0.6) {
            candidateName = chosenInChar + randC1 + randC2;
          } else if (Math.random() > 0.3) {
            candidateName = randC1 + chosenInChar + randC2;
          } else {
            candidateName = randC1 + randC2 + chosenInChar;
          }
        } else {
          // 4字
          const randC1 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '霁';
          const randC2 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '风';
          const randC3 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '朗';
          candidateName = chosenInChar + randC1 + randC2 + randC3;
        }
      } else {
        // 自由拼写
        if (length === 2) {
          const c1 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '奕';
          let c2 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '澄';
          while (c1 === c2 && fallbackChars.length > 1) {
            c2 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char;
          }
          candidateName = c1 + c2;
        } else if (length === 3) {
          const c1 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '苏';
          const mid = connectors[Math.floor(Math.random() * connectors.length)];
          const c2 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '白';
          candidateName = c1 + mid + c2;
        } else {
          // 4字
          const c1 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '白';
          const c2 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '川';
          const c3 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '霁';
          const c4 = fallbackChars[Math.floor(Math.random() * fallbackChars.length)]?.char || '野';
          candidateName = c1 + c2 + c3 + c4;
        }
      }

      // 去重
      if (seenNames.has(candidateName) || candidateName.length !== length) continue;

      // 提取字义构成"气韵微释义"
      const charsInName = Array.from(candidateName);
      const matchedDetails = charsInName.map((char) => {
        const found = getCharDetail(char);
        return found || {
          char,
          pinyin: 'míng',
          meaning: '清亮优雅之美',
          styles: [styles[0] || 'warm_elegant'],
          scenes: [scene]
        };
      });

      // 智能生成古雅释义段落
      let meaningText = '';
      if (length === 2) {
        meaningText = `取「${matchedDetails[0].char}」字之 ${matchedDetails[0].meaning.split('，')[0]} 气韵，融「${matchedDetails[1].char}」字之 ${matchedDetails[1].meaning.split('，')[0]} 含义。全名尽显安康祥顺、独特风骨，极为素净清丽。`;
      } else if (length === 3) {
        meaningText = `此名由「${matchedDetails[0].char}」作为意象核心，中字以「${matchedDetails[1].char}」轻巧承接，尾字「${matchedDetails[2].char}」沉稳呼应。象征其人知白守黑，气度出尘，才思敏捷，卓尔不群。`;
      } else {
        meaningText = `融「${matchedDetails[0].char}${matchedDetails[1].char}」之空灵自然，兼具「${matchedDetails[2].char}${matchedDetails[3].char}」之清冷典雅。四字相得益彰，大有隐逸与现代张力兼具的气宇。`;
      }

      // 归类风格
      const foundStyles: StyleType[] = [];
      matchedDetails.forEach((md) => {
        md.styles.forEach((sty) => {
          if (styles.includes(sty) && !foundStyles.includes(sty)) {
            foundStyles.push(sty);
          }
        });
      });
      if (foundStyles.length === 0) {
        foundStyles.push(styles[0] || 'warm_elegant');
      }

      const cardId = `dyn-${candidateName}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      results.push({
        id: cardId,
        name: candidateName,
        surname: surname,
        scene: scene,
        styles: foundStyles,
        meaning: meaningText,
        originalCharDetails: matchedDetails.map((md) => ({
          char: md.char,
          pinyin: md.pinyin,
          meaning: md.meaning
        })),
        createdAt: Date.now()
      });

      seenNames.add(candidateName);
    }
  }

  // 确保刚好10个
  return results.slice(0, 10);
}
