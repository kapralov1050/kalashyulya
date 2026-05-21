declare module '@websitebeaver/vue-magnifier' {
  import type { DefineComponent } from 'vue'

  export type MgShape = 'circle' | 'square'

  export interface Props {
    src: string
    width?: string | number
    height?: string | number
    className?: string
    zoomImgSrc?: string
    zoomFactor?: number
    mgWidth?: number
    mgHeight?: number
    mgBorderWidth?: number
    mgShape?: MgShape
    mgShowOverflow?: boolean
    mgMouseOffsetX?: number
    mgMouseOffsetY?: number
    mgTouchOffsetX?: number
    mgTouchOffsetY?: number
    mgShow?: boolean
    mgCornerBgColor?: string
  }

  const VueMagnifier: DefineComponent<Props>
  export default VueMagnifier
}
