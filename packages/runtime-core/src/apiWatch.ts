import { EffectDepend } from '@coderwei-mini-vue3/reactive'
import { extend } from '@coderwei-mini-vue3/shared'
import { queuePosstFlushCb, queuePreFlushCb } from './scheduler'

export interface watchEffectOptions {
  flush?: 'pre' | 'post' | 'sync'
  onTrack?: (event) => void
  onTrigger?: (event) => void
}

export type watchFnTypes = (onCleanup?) => void

export function watchEffect(fn: watchFnTypes, options: watchEffectOptions = {}) {
  return doWatch(fn, options)
}

// watchPostEffect就是watchEffect的options传递了post
export function watchPostEffect(fn: watchFnTypes, options: watchEffectOptions = {}) {
  return doWatch(fn, extend({}, options, { flush: 'post' }))
}

// watchSyncEffect就是watchEffect的options传递了sync
export function watchSyncEffect(fn: watchFnTypes, options: watchEffectOptions = {}) {
  return doWatch(fn, extend({}, options, { flush: 'sync' }))
}

function doWatch(fn, options: watchEffectOptions) {
  const job = () => {
    effect.run()
  }

  let scheduler: (...arg) => void
  if (options.flush === 'post') {
    scheduler = scheduler = () => {
      queuePosstFlushCb(job)
    }
  } else if (options.flush === 'sync') {
    scheduler = job
  } else {
    // pre需要放在最后，因为用户不传和主动传递pre都是走这里
    scheduler = () => {
      queuePreFlushCb(job)
    }
  }
  let cleanup
  // 这个clearup函数就是用户调用的onCleanup,用户在调用这个函数的时候会传递一个函数，用于做用户属于自己的操作，他会在每次watchEffect执行的时候先执行一次(不包括第一次,第一次是默认执行的)
  const onCleanup = (cb) => {
    cleanup = () => {
      console.log('Calls the function passed in by the user')
      cb()
    }
  }
  const getter = () => {
    if (cleanup) {
      cleanup()
    }
    fn(onCleanup)
  }
  const effect = new EffectDepend(getter, scheduler)

  // 执行一次用户传入的fn  watchEffect是会默认执行一次的
  effect.run()

  return () => {
    effect.stop()
  }
}
