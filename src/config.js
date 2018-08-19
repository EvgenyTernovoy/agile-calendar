export const commonEnvProps = {
  screenWidth: window.screen.availWidth,
  windowWidth: window.innerWidth,
}

// passed here by webpack.DefinePlugin from config
const apiUrl = process.env.apiUrl || 'http://localhost:3003'
const tpApiHost = process.env.tpApiHost || 'test-api'
const publicBucket =
  process.env.publicBucket || 'instapay-operations-public-dev'

export default {
  apiUrl,
  tpApiHost,
  publicBucket,
}
