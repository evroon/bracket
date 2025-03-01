import nextra from 'nextra'

const withNextra = nextra({
  contentDirBasePath: '/docs'
})

export default withNextra({
  reactStrictMode: true,
  skipTrailingSlashRedirect: true,
  // Export only when building in GitHub Actions
  output: process.env.GITHUB_ACTION ? 'export' : 'export',
  images: {
    unoptimized: true
  }
})
