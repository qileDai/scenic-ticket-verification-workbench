import { onMount } from 'solid-js'
import { Router, Route } from '@solidjs/router'
import Layout from './components/Layout'
import CouponOverview from './pages/CouponOverview'
import ExceptionWorkspace from './pages/ExceptionWorkspace'
import RecordDetail from './pages/RecordDetail'
import RuleSandbox from './pages/RuleSandbox'
import DuplicateQueue from './pages/DuplicateQueue'
import ChartPanel from './pages/ChartPanel'
import { initializeSeedData } from './data/seed'

export default function App() {
  onMount(async () => {
    console.log('景区门票团购核销异常分诊交互复核工作台已启动')
    await initializeSeedData()
  })

  return (
    <Router>
      <Layout>
        <Route path="/" component={CouponOverview} />
        <Route path="/exceptions" component={ExceptionWorkspace} />
        <Route path="/records/:id" component={RecordDetail} />
        <Route path="/rules" component={RuleSandbox} />
        <Route path="/duplicates" component={DuplicateQueue} />
        <Route path="/charts" component={ChartPanel} />
      </Layout>
    </Router>
  )
}
