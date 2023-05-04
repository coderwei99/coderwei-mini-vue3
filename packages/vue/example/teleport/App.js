import { h, Teleport } from '../../lib/vue3.esm.js'

export default {
  name: 'App',
  setup() {},
  render() {
    const Tele = h(
      Teleport,
      { to: 'body' },
      h('div', { id: 'tem', style: { color: 'red' } }, 'teleport is here')
    )
    return h('div', { id: 'demo' }, [h('div', 'i an in demo container'), Tele])
  }
}
