import type { CardInfo } from './types'

type FullData = Record<string, CardInfo>
import data from '../assets/data.json'

const fullData: FullData = data

export class Draw {
  /**
   * 单次抽卡
   * @param {Array<string>} deck 牌堆(代号列表)
   */
  index: string //单卡代号
  info: CardInfo //单卡信息
  rotation: boolean //1：正位 0：逆位
  discription: string
  constructor(deck: string[], index?: string) {
    if (!index) {
      this.index = doDraw(deck)
    } else {
      this.index = index
    }
    const info = getCardInfo(this.index)
    console.log('info :>> ', this.index)
    this.info = info
    this.rotation = Math.random() > 0.5
    this.discription = this.discribe()
  }
  discribe() {
    return `这张牌是${this.rotation ? '正位' : '逆位'}的${
      this.info.name
    }；它的含义是${this.info.content}；${
      this.rotation ? '正位' : '逆位'
    }代表着${this.rotation ? this.info.upright : this.info.reversed}`
  }
}
/**
 * 生成卡组
 * @param {Number} type 0:全部 1:仅大卡 2:所有小卡 3:仅数字小卡
 */
export const createCardDeck = (type: number): Array<string> => {
  // 小卡1-10数字，11-14功能；大卡编号0-21
  let cards = []
  let a = Array.from({ length: 22 }, (_, i) => i.toString())
  let c = Array.from({ length: 14 }, (_, i) => 'c' + (i + 1))
  let s = Array.from({ length: 14 }, (_, i) => 's' + (i + 1))
  let w = Array.from({ length: 14 }, (_, i) => 'w' + (i + 1))
  let p = Array.from({ length: 14 }, (_, i) => 'p' + (i + 1))
  switch (type) {
    case 0:
      cards = [...a, ...c, ...s, ...w, ...p]
      break
    case 1:
      cards = a
      break
    case 2:
      cards = [...c, ...s, ...w, ...p]
      break
    case 3:
      cards = [
        ...c.slice(0, -4),
        ...s.slice(0, -4),
        ...w.slice(0, -4),
        ...p.slice(0, -4),
      ]
      break
    default:
      cards = [...a, ...c, ...s, ...w, ...p]
      break
  }
  return shuffle(cards)
}

/**
 * 洗牌
 * @param {Array<string>} array
 */
export const shuffle = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)) // 随机选一个0-i的索引
    ;[array[i], array[j]] = [array[j], array[i]] // 交换元素
  }
  return array
}
/**
 * 抽卡后从牌堆里去掉此牌
 * @param {Array<string>} cards 牌堆
 */
export const doDraw = (cards: string[]): string => {
  let randomIndex = Math.floor(Math.random() * cards.length)
  let card = cards[randomIndex]
  cards.splice(randomIndex, 1)
  return card
}

/**
 * 查询单卡信息
 * @param {string} card
 */
export const getCardInfo = (card: string): CardInfo => {
  return fullData[card]
}

/**
 * 查询卡信息
 * @param {Array<string>} cardList
 */
export const getCardsInfo = (cardList: string[]): CardInfo[] => {
  return cardList.map((item) => {
    return fullData[item]
  })
}
