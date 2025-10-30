declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // Use `unknown` for the slot/props/bindings to avoid `any` while remaining flexible
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
