import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: 'Helvetica', color: '#333' },
  header: { marginBottom: 20, borderBottom: 1, borderBottomColor: '#eee', paddingBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  contact: { flexDirection: 'row', gap: 10, color: '#666', marginBottom: 2 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginTop: 15, marginBottom: 8, color: '#2563eb', textTransform: 'uppercase' },
  itemTitle: { fontSize: 11, fontWeight: 'bold', color: '#000' },
  itemSub: { fontSize: 10, color: '#666', marginBottom: 4 },
  description: { lineHeight: 1.4, marginBottom: 8 },
  skillBadge: { backgroundColor: '#f3f4f6', padding: '4 8', borderRadius: 4, marginRight: 5, marginBottom: 5 }
});

export const ATSResume = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.personal_info.full_name}</Text>
        <View style={styles.contact}>
          <Text>{data.personal_info.email} | {data.personal_info.phone}</Text>
        </View>
        <Text style={{ color: '#666' }}>{data.personal_info.location} {data.personal_info.linkedin ? `| ${data.personal_info.linkedin}` : ''}</Text>
      </View>

      {/* Summary */}
      <View>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.description}>{data.summary}</Text>
      </View>

      {/* Experience */}
      <View>
        <Text style={styles.sectionTitle}>Work Experience</Text>
        {data.work_experience.map((exp: any, i: number) => (
          <View key={i} style={{ marginBottom: 10 }}>
            <Text style={styles.itemTitle}>{exp.job_title} @ {exp.company}</Text>
            <Text style={styles.itemSub}>{exp.start_date} - {exp.end_date} | {exp.location}</Text>
            <Text style={styles.description}>{exp.description}</Text>
          </View>
        ))}
      </View>

      {/* Education */}
      <View>
        <Text style={styles.sectionTitle}>Education</Text>
        {data.education.map((edu: any, i: number) => (
          <View key={i} style={{ marginBottom: 5 }}>
            <Text style={styles.itemTitle}>{edu.degree}</Text>
            <Text style={styles.itemSub}>{edu.institution} | {edu.graduation_year}</Text>
          </View>
        ))}
      </View>

      {/* Skills */}
      <View>
        <Text style={styles.sectionTitle}>Skills</Text>
        <Text>{data.skills.join(' • ')}</Text>
      </View>
    </Page>
  </Document>
);