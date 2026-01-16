<template>
  <!-- <input type="number" v-model="cardNumber" /> -->
  <input type="text" v-model="userQuestion" placeholder="请输入要占卜的问题" />
  <div class="card-spare" v-if="draws.length != cardNumber">
    {{ draws.map((item) => item.info.name).join(' ') }}
  </div>
  <div class="hexagram">
    <!-- <div
      class="hexagram-card"
      id="card1"
      v-for="(item, index) in new Array(6).fill(null).map((_, index) => index)">
      {{ draws.length > index ? draws[index].info.name : '' }}
    </div> -->
    <div
      v-for="index in 7"
      :key="index"
      class="hexagram-card"
      :style="getCardPosition(index - 1)">
      {{ draws.length > index - 1 ? draws[index - 1].info.name : '' }}
    </div>
  </div>
  <div class="cards-wrapper" v-if="draws.length < cardNumber">
    <div>点击选中卡牌，再次点击抽卡，向右滑动查看更多卡牌</div>
    <div class="cards-container">
      <div
        :class="`card-single ${holdCard == item ? 'hold' : ''}`"
        v-for="(item, index) in deck"
        :key="index"
        :style="{
          left: index * 50 + 'px',
          'z-index': index + 2,
        }"
        @click="handleClickCard(item, index)">
        {{}}
      </div>
    </div>
  </div>
  <button
    @click="handleExplain"
    v-if="draws.length == cardNumber"
    :disabled="loading">
    {{ loading ? '解读中……' : '解读' }}
  </button>
  <div class="explain" v-html="explainText"></div>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, watch, onMounted } from 'vue'
  import {
    Draw,
    createCardDeck,
    shuffle,
    doDraw,
    getCardsInfo,
  } from './utils/draw'
  import { llmExplain, llmExplainSingle } from './api/coze'
  import type { CardInfo } from './utils/types'
  import { marked } from 'marked'
  let deck = reactive<string[]>([])
  const draws = reactive<Draw[]>([])
  const cut = ref<Draw | null>(null)
  const explainText = ref<any>('')
  const holdCard = ref<string>('-1')
  const cardNumber = ref<number>(7)
  const userQuestion = ref<string>('')
  const loading = ref<boolean>(false)
  deck.push(...createCardDeck(0))

  onMounted(() => {
    // placeCard()
  })

  function handleClickCard(item: string, index: number) {
    console.log('handleClickCard :>> ', item, index)
    if (holdCard.value == item) {
      // 第二次点同一张的时候确认抽卡
      drawCard(holdCard.value)
      deck.splice(index, 1)
      holdCard.value = '-1'
    } else {
      // 第一次点选择卡片
      holdCard.value = item
    }
    console.log('draws :>> ', draws)
  }
  function drawCut() {
    cut.value = new Draw(deck, undefined)
    console.log('this.cut.info :>> ', deck.length, cut.value.info)
  }
  function drawCard(index: string) {
    draws.push(new Draw(deck, index))
    console.log('draws :>> ', draws)
    if (draws.length == cardNumber.value) {
      // placeCard()
    }
  }
  function placeCard() {
    const radius = 90 // 半径，决定了六芒星的大小
    const cards = document.querySelectorAll(
      '.hexagram-card'
    ) as NodeListOf<HTMLElement>
    const angles = [30, 90, 150, 210, 270, 330] // 每个点对应的角度

    cards.forEach((card, index) => {
      const angle = (angles[index] * Math.PI) / 180 // 将角度转换为弧度
      card.style.top = `${radius - Math.sin(angle) * radius}px`
      card.style.left = `${radius + Math.cos(angle) * radius}px`
    })
  }
  function getCardPosition(cardIndex: number) {
    const RADIUS = 80
    if (cardIndex === 6) {
      // 第7张（索引6）是中心牌 → 居中
      return {
        // transform: 'translate(-50%, -50%)',
        // left: '50%',
        // top: '50%',
      }
    }

    // 外围6张牌（索引 0~5）
    const angle = (cardIndex / 6) * Math.PI * 2 - Math.PI / 2 // 从顶部开始（-π/2）
    const x = RADIUS * Math.cos(angle)
    const y = RADIUS * Math.sin(angle)

    return {
      transform: `translate(${x}px, ${y}px)`,
      // 注意：不设 left/top，靠 transform 定位
    }
  }
  function handleExplain() {
    if (!userQuestion.value) {
      alert('请输入想占卜的问题')
      return
    }
    loading.value = true
    let prompt: string = `你是一位经验丰富的塔罗占卜师，请根据以下信息对用户的塔罗牌阵进行深入、有同理心且实用的解读：
  用户问题：[${userQuestion.value}]
  所用牌阵：[六芒星牌阵（象征天地合一的神秘牌阵，七张牌呈现问题的内在与外在、过去与未来的完整面貌。）]
  抽牌结果（按牌阵位置顺序列出）：
  位置1（[“顶点：灵性指引与更高视角”]）：[${draws[0].info.name}]
  位置2（[“右上：未来的可能性”]）：[${draws[2].info.name}]
  位置3（[“右下：外在行动与表现”]）：[${draws[4].info.name}]
  位置4（[“底部：物质基础与现实”]）：[${draws[3].info.name}]
  位置5（[“左下：内在情感与直觉”]）：[${draws[5].info.name}]
  位置6（[“左上：过去的影响”]）：[${draws[1].info.name}]
  位置7（[“中心：问题的核心本质”]）：[${draws[6].info.name}]
  每张牌的详细含义：
  [${draws[0].info.name}] ${draws[0].discription}
  [${draws[2].info.name}]  ${draws[2].discription}
  [${draws[4].info.name}] ${draws[4].discription}
  [ ${draws[3].info.name}]  ${draws[3].discription}
  [${draws[5].info.name}] ${draws[5].discription}
  [${draws[1].info.name}] ${draws[1].discription}
  [${draws[6].info.name}] ${draws[6].discription} 
  请结合牌阵逻辑、牌与牌之间的互动、正逆位影响，以及用户的问题背景，给出：
  1. 整体局势的概括；
  2. 每张牌在对应位置上的具体解读；
  3. 牌阵中显现的关键主题、潜在机会或警示；
  4. 针对用户问题的建议或行动指引；
  5. 保持语气温和、鼓励，避免绝对化断言（如“一定会失败”），强调自由意志与可能性。`
    // console.log('prompt :>> ', prompt)
    llmExplainSingle(prompt)
      .then((res) => {
        loading.value = false
        console.log('res :>> ', res)
        explainText.value = marked(res)
      })
      .catch((err) => {
        loading.value = false
        explainText.value = '不好意思系统开小差了，请稍后再试～'
      })
  }

  // llmExplain(prompt)
</script>

<style scoped lang="less">
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
  }
  .container {
    width: 100vw;
    min-height: 100vh;
    background: #16161e;
  }
  .cards-wrapper {
    width: 100vw;
    // overflow: hidden;
    padding-top: 100px;
    position: absolute;
    bottom: 0;
    .cards-container {
      // margin-top: 100px;
      position: relative;
      // bottom: 0;
      width: 100%;
      height: 400px;
      display: flex;
      justify-content: space-between;
      overflow: scroll;
      .card-single {
        position: absolute;
        height: 300px;
        width: 180px;
        min-width: 180px;
        bottom: 0;
        border: 2px solid #ffd915;
        border-radius: 5px;
        background-color: #56379f;
        background-repeat: no-repeat;
        transition: all 0.2s;
        &.hold {
          transform: translateY(-50px);
        }
      }
    }
  }
  .card-spare {
    color: #fff;
  }
  .hexagram {
    position: relative;
    width: 200px; /* 根据需要调整 */
    height: 200px; /* 根据需要调整 */
    margin: 100px auto; /* 居中显示 */
  }

  // .hexagram-card {
  //   position: absolute;
  //   width: 50px;
  //   height: 70px; /* 调整到你想要的卡片尺寸 */
  //   background-color: white;
  //   border: 1px solid #000;
  //   text-align: center;
  //   // line-height: 70px; /* 垂直居中文本 */
  // }
  .hexagram-card {
    position: absolute;
    width: 50px;
    height: 70px;
    background-color: white;
    border: 1px solid #000;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    box-sizing: border-box;
    left: 0;
    top: 0;
  }
  .hexagram-card-center {
    width: 60px;
    height: 80px;
    background-color: #f0f8ff;
    border: 2px solid #4a90e2;
    z-index: 10;
  }
  .explain {
    width: 100%;
  }
</style>
