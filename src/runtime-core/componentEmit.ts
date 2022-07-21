import { toHandlerKey, camelCase } from "../shared/index";
export function emit(instance: any, eventName: string, ...arg: unknown[]) {
  // console.log(eventName);

  // 先从实例中拿出props
  const { props } = instance;

  const event = toHandlerKey(camelCase(eventName));

  console.log("event", event);

  const handle = props[event];
  console.log(props, "props");

  handle && handle(...arg);
}
