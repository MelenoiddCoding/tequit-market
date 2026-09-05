import type{LegalDocument}from "@/lib/legal-documents";
import styles from "@/components/legal.module.css";

export function LegalDocumentContent({document,compact=false}:{document:LegalDocument;compact?:boolean}){return <article className={compact?styles.documentCompact:styles.document}>
  {!compact&&<header className={styles.documentHeader}><p className="eyebrow">Información legal</p><h1>{document.title}</h1><p>{document.summary}</p><dl><div><dt>Versión</dt><dd>{document.version}</dd></div><div><dt>Vigente desde</dt><dd>{document.effectiveDate}</dd></div></dl></header>}
  <div className={styles.documentBody}>{document.sections.map(section=><section key={section.title}><h2>{section.title}</h2>{section.paragraphs?.map(paragraph=><p key={paragraph}>{paragraph}</p>)}{section.items&&<ul>{section.items.map(item=><li key={item}>{item}</li>)}</ul>}</section>)}</div>
</article>}
