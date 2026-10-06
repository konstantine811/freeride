import { siteContentSchema } from '../data/content'
import type { SiteContent } from '../data/content'

export const contentStorageVersion = 2

// Preserve editorial order without putting full reports in the settings document.
export function splitContent(content: SiteContent) {
  const { reports, ...settings } = siteContentSchema.parse(content)
  return { settings, reports: reports.map((report, order) => ({ report, order })) }
}

export async function migrateLocalImages(content: SiteContent, upload: (path: string) => Promise<string>): Promise<SiteContent> {
  const migrated = structuredClone(content)
  const urls = new Map<string, Promise<string>>()
  const resolve = (path: string) => {
    if (!path.startsWith('/images/')) return Promise.resolve(path)
    if (!urls.has(path)) urls.set(path, upload(path))
    return urls.get(path)!
  }
  // Sequential uploads avoid saturating the browser with the large parallax images.
  for (const key of Object.keys(migrated.images)) migrated.images[key] = await resolve(migrated.images[key])
  for (const report of migrated.reports) {
    report.image = await resolve(report.image)
    for (const photo of report.photos) photo.src = await resolve(photo.src)
    if (report.route?.previewImage) report.route.previewImage = await resolve(report.route.previewImage)
  }
  return siteContentSchema.parse(migrated)
}
