import pb from '@/lib/pocketbase/client'
import type { ReportSchedule } from '@/types'

export const getReportSchedules = async (): Promise<ReportSchedule[]> => {
  try {
    return (await pb
      .collection('report_schedules')
      .getFullList({ sort: '-created' })) as unknown as ReportSchedule[]
  } catch {
    return []
  }
}

export const createReportSchedule = async (
  data: Partial<ReportSchedule>,
): Promise<ReportSchedule | null> => {
  try {
    return (await pb.collection('report_schedules').create(data)) as unknown as ReportSchedule
  } catch {
    return null
  }
}

export const updateReportSchedule = async (
  id: string,
  data: Partial<ReportSchedule>,
): Promise<void> => {
  try {
    await pb.collection('report_schedules').update(id, data)
  } catch {
    /* intentionally ignored */
  }
}
