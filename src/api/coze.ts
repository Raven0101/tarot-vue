import axios from 'axios'
const K = 'pat_symfoiwDBXtzWFyR2SwJmXUdBus9UxQnghANMnSd0szVHDpG2QGuNXdimTL0XhtO'
/**
 * 大模型解读
 * @param {Array<string>} cards
 * @param {string} cut
 * @param {string} input
 * @returns {Promise<any>}
 */
export const llmExplain = (
  cards: string,
  cut: string,
  input: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        '/v1/workflow/run',
        {
          parameters: {
            cards: cards,
            userInput: input,
            cut: cut,
          },
          workflow_id: '7446957155019702283',
        },
        {
          headers: {
            Authorization: 'Bearer ' + K,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((response) => {
        let res = JSON.parse(response.data.data).data
        resolve(res)
      })
      .catch((error) => {
        reject(error)
        console.error('Error:', error)
      })
  })
}

/**
 * 解读单张卡牌
 * @param {string} card prompt
 * @returns {Promise<any>}
 */
export const llmExplainSingle = (card: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        '/v1/workflow/run',
        {
          parameters: {
            card: card,
          },
          workflow_id: '7485949600777338916',
        },
        {
          headers: {
            Authorization: 'Bearer ' + K,
            'Content-Type': 'application/json',
          },
        }
      )
      .then((response) => {
        let res = JSON.parse(response.data.data).output
        resolve(res)
      })
      .catch(function (error) {
        reject(error)
        console.error('Error:', error)
      })
  })
}
