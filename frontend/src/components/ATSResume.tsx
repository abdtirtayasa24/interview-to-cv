import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

interface PersonalInfo {
  full_name?: string
  email?: string
  phone?: string
  location?: string
  linkedin?: string
}

interface WorkExperience {
  job_title?: string
  company?: string
  location?: string
  start_date?: string
  end_date?: string
  description?: string
}

interface Education {
  degree?: string
  institution?: string
  graduation_year?: string
}

interface CvData {
  personal_info?: PersonalInfo
  summary?: string
  work_experience?: WorkExperience[]
  education?: Education[]
  skills?: string[]
  languages?: string[]
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 38,
    paddingRight: 42,
    paddingBottom: 40,
    paddingLeft: 42,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2937',
    lineHeight: 1.35,
  },
  header: {
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 5,
  },
  contactLine: {
    fontSize: 9.5,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 1.35,
  },
  section: {
    marginTop: 11,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingBottom: 3,
    marginBottom: 6,
    borderBottomWidth: 0.75,
    borderBottomColor: '#9ca3af',
  },
  paragraph: {
    fontSize: 10,
    color: '#1f2937',
    lineHeight: 1.45,
  },
  roleBlock: {
    marginBottom: 9,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  roleTitle: {
    width: '68%',
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  roleDates: {
    width: '30%',
    fontSize: 9.5,
    color: '#374151',
    textAlign: 'right',
  },
  companyLine: {
    fontSize: 9.8,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2.5,
  },
  bullet: {
    width: 10,
    fontSize: 10,
    color: '#1f2937',
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#1f2937',
    lineHeight: 1.38,
  },
  educationBlock: {
    marginBottom: 7,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  educationTitle: {
    width: '72%',
    fontSize: 10.2,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  educationDate: {
    width: '26%',
    fontSize: 9.5,
    color: '#374151',
    textAlign: 'right',
  },
  muted: {
    fontSize: 9.8,
    color: '#374151',
  },
  skillsText: {
    fontSize: 10,
    color: '#1f2937',
    lineHeight: 1.45,
  },
})

function valueOrEmpty(value?: string) {
  return value?.trim() ?? ''
}

function joinDefined(parts: string[], separator = ' | ') {
  return parts.filter(Boolean).join(separator)
}

function splitDescription(description?: string) {
  const normalized = valueOrEmpty(description)
  if (!normalized) return []

  const explicitLines = normalized
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)

  if (explicitLines.length > 1) return explicitLines

  const sentences = normalized
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)

  return sentences.length > 1 ? sentences.slice(0, 5) : [normalized]
}

function renderBullet(text: string, index: number) {
  return (
    <View key={`${index}-${text}`} style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  )
}

export const ATSResume = ({ data }: { data: CvData }) => {
  const personalInfo = data.personal_info ?? {}
  const fullName = valueOrEmpty(personalInfo.full_name) || 'Candidate Name'
  const contactLine = joinDefined([
    valueOrEmpty(personalInfo.email),
    valueOrEmpty(personalInfo.phone),
    valueOrEmpty(personalInfo.location),
    valueOrEmpty(personalInfo.linkedin),
  ])
  const workExperience = data.work_experience ?? []
  const education = data.education ?? []
  const skills = data.skills ?? []
  const languages = data.languages ?? []

  return (
    <Document title={`${fullName} CV`} author="AI CV Generator">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{fullName}</Text>
          {contactLine && <Text style={styles.contactLine}>{contactLine}</Text>}
        </View>

        {data.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.paragraph}>{data.summary}</Text>
          </View>
        )}

        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Core Skills</Text>
            <Text style={styles.skillsText}>{skills.join(' | ')}</Text>
          </View>
        )}

        {workExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {workExperience.map((experience, index) => {
              const title = joinDefined([
                valueOrEmpty(experience.job_title),
                valueOrEmpty(experience.company),
              ], ' | ')
              const companyLine = joinDefined([
                valueOrEmpty(experience.company),
                valueOrEmpty(experience.location),
              ])
              const dateLine = joinDefined([
                valueOrEmpty(experience.start_date),
                valueOrEmpty(experience.end_date),
              ], ' - ')
              const bullets = splitDescription(experience.description)

              return (
                <View key={`${title}-${index}`} style={styles.roleBlock} wrap={false}>
                  <View style={styles.roleHeader}>
                    <Text style={styles.roleTitle}>{title || 'Professional Role'}</Text>
                    {dateLine && <Text style={styles.roleDates}>{dateLine}</Text>}
                  </View>
                  {companyLine && <Text style={styles.companyLine}>{companyLine}</Text>}
                  {bullets.map(renderBullet)}
                </View>
              )
            })}
          </View>
        )}

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((item, index) => (
              <View key={`${item.degree}-${index}`} style={styles.educationBlock}>
                <View style={styles.educationHeader}>
                  <Text style={styles.educationTitle}>{valueOrEmpty(item.degree) || 'Education'}</Text>
                  {item.graduation_year && (
                    <Text style={styles.educationDate}>{item.graduation_year}</Text>
                  )}
                </View>
                {item.institution && <Text style={styles.muted}>{item.institution}</Text>}
              </View>
            ))}
          </View>
        )}

        {languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <Text style={styles.skillsText}>{languages.join(' | ')}</Text>
          </View>
        )}
      </Page>
    </Document>
  )
}
