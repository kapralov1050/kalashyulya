export interface Metric {
  counter: number
  last_updated: string
  type: 'button_click' | 'page_view'
}

export interface StatsData {
  [year: string]: {
    [month: string]: {
      [day: string]: {
        [metricName: string]: Metric
      }
    }
  }
}
