/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Link } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-italic.ttf', fontStyle: 'italic' },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700italic.ttf', fontWeight: 700, fontStyle: 'italic' },
  ]
});

const ACCENT = '#1a5276';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 25,
    fontFamily: 'Open Sans',
    fontSize: 9,
    color: '#222',
    lineHeight: 1.45,
  },
  // ─── Header ───
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: 700,
    color: ACCENT,
  },
  headerRight: {
    textAlign: 'right',
    fontSize: 8.5,
    color: '#333',
  },
  headerLeft: {
    fontSize: 8.5,
    color: '#333',
  },
  title: {
    fontSize: 10,
    fontWeight: 700,
    color: ACCENT,
    marginBottom: 2,
  },
  linksRight: {
    textAlign: 'right',
    fontSize: 8.5,
    fontWeight: 600,
    color: ACCENT,
  },
  // ─── Sections ───
  divider: {
    borderBottomWidth: 1.2,
    borderBottomColor: ACCENT,
    marginTop: 6,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#111',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  // ─── Objective ───
  objectiveText: {
    fontSize: 8.5,
    color: '#333',
    lineHeight: 1.5,
    marginTop: 2,
  },
  // ─── Skills ───
  skillRow: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  skillCategory: {
    fontWeight: 700,
    fontSize: 8.5,
    color: '#111',
  },
  skillValues: {
    fontSize: 8.5,
    color: '#333',
    flex: 1,
  },
  // ─── Experience ───
  jobHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  companyTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    color: ACCENT,
  },
  dateText: {
    fontSize: 8.5,
    fontStyle: 'italic',
    color: '#444',
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 1,
    paddingLeft: 12,
  },
  bulletDot: {
    width: 8,
    fontSize: 9,
    color: '#333',
  },
  bulletText: {
    flex: 1,
    fontSize: 8.5,
    color: '#333',
  },
  // ─── Projects ───
  projectHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 1,
  },
  projectName: {
    fontSize: 9,
    fontWeight: 700,
    color: ACCENT,
  },
  projectTech: {
    fontSize: 8.5,
    color: '#333',
  },
  projectLink: {
    fontSize: 8.5,
    color: ACCENT,
    fontWeight: 600,
  },
  projectDesc: {
    fontSize: 8.5,
    color: '#333',
    paddingLeft: 0,
    marginBottom: 1,
  },
  // ─── Education ───
  eduHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eduDegree: {
    fontSize: 9,
    fontWeight: 700,
    color: ACCENT,
  },
  eduMeta: {
    fontSize: 8.5,
    color: '#333',
  },
  eduCoursework: {
    fontSize: 8,
    color: '#444',
    marginTop: 1,
  },
  // ─── Certifications ───
  certText: {
    fontSize: 8.5,
    color: '#333',
  },
});

export const PDFTemplate = ({ data }: { data: any }) => {
  const basics = data.basics || {};
  const skills = data.skills || {};
  const work = (data.work || []) as any[];
  const projects = (data.projects || []) as any[];
  const education = (data.education || []) as any[];
  const certifications = (data.certifications || []) as any[];

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ═══ HEADER ═══ */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.name}>{basics.name || "YOUR NAME"}</Text>
            <Text style={[styles.headerLeft, { marginTop: 2 }]}>{basics.email || ""}</Text>
            <Text style={[styles.title, { marginTop: 2 }]}>{basics.title || ""}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerRight}>
              {[basics.phone, basics.location].filter(Boolean).join(" | ")}
            </Text>
            {basics.links && basics.links.length > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 2 }}>
                {basics.links.map((url: string, idx: number) => {
                  if (!url) return null;
                  const isUrl = url.includes("http") || url.includes("www");
                  const label = url.replace("https://", "").replace("www.", "").split("/")[0];
                  return (
                    <Text key={idx} style={styles.linksRight}>
                      {isUrl ? <Link src={url} style={{ color: '#1a5276', textDecoration: 'none' }}>{label}</Link> : url}
                      {idx < basics.links.length - 1 ? " | " : ""}
                    </Text>
                  );
                })}
              </View>
            )}
          </View>
        </View>

        {/* ═══ SUMMARY ═══ */}
        {basics.objective && (
          <View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.objectiveText}>{basics.objective}</Text>
          </View>
        )}

        {/* ═══ SKILLS ═══ */}
        {Object.keys(skills).length > 0 && (
          <View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={{ marginTop: 2 }}>
              {Object.entries(skills).map(([category, values], i) => (
                <View key={i} style={styles.skillRow}>
                  <Text style={styles.skillCategory}>{category}: </Text>
                  <Text style={styles.skillValues}>{values as string}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ═══ EXPERIENCE ═══ */}
        {work.length > 0 && (
          <View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Experience</Text>
            {work.map((job: any, idx: number) => (
              <View key={idx} style={{ marginTop: 3, marginBottom: 2 }}>
                <View style={styles.jobHeaderRow}>
                  <Text style={styles.companyTitle}>
                    {job.company} – {job.position}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {job.startDate} – {job.endDate}
                </Text>
                {job.bullets?.map((b: string, i: number) => (
                  <View key={i} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* ═══ PROJECTS ═══ */}
        {projects.length > 0 && (
          <View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((p: any, idx: number) => (
              <View key={idx} style={{ marginTop: 3, marginBottom: 2 }}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName}>{p.name}</Text>
                  {p.tech && (
                    <Text style={styles.projectTech}> – {p.tech}</Text>
                  )}
                  {p.link && (
                    <Text style={styles.projectLink}>
                      {' | '}
                      {p.link.includes('http') ? (
                        <Link src={p.link} style={{ color: '#1a5276', textDecoration: 'none' }}>Live Link</Link>
                      ) : (
                        p.link
                      )}
                    </Text>
                  )}
                </View>
                {p.description && (
                  <Text style={styles.projectDesc}>{p.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ═══ EDUCATION ═══ */}
        {education.length > 0 && (
          <View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu: any, idx: number) => (
              <View key={idx} style={{ marginTop: 3 }}>
                <View style={styles.eduHeader}>
                  <Text style={styles.eduDegree}>
                    {edu.degree} – {edu.institution}
                    {edu.cgpa ? ` | CGPA: ${edu.cgpa}` : ''}
                  </Text>
                </View>
                <Text style={styles.eduMeta}>
                  {edu.startDate} – {edu.endDate}
                </Text>
                {edu.coursework && (
                  <Text style={styles.eduCoursework}>
                    Relevant Coursework: {edu.coursework}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ═══ CERTIFICATIONS ═══ */}
        {certifications.length > 0 && (
          <View>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((cert: any, idx: number) => (
              <Text key={idx} style={styles.certText}>
                {cert.name} {cert.year ? `| ${cert.year}` : ''}
              </Text>
            ))}
          </View>
        )}

      </Page>
    </Document>
  );
};
