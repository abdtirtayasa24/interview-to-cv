# Interview-to-CV

Interview-to-CV turns interview recordings into candidate CV data and downloadable CV documents.

## Language

**User**:
An authenticated person who owns CV Templates and Conversion History records.
_Avoid_: Account, customer

**CV Template**:
A user-owned `.docx` document that defines the layout for a generated CV.
_Avoid_: Template file, document template

**Conversion History**:
A user's saved record of a completed interview-to-CV conversion.
_Avoid_: Recent conversions, history row

**Interview Recording**:
An uploaded audio or video file containing the candidate interview to be converted into CV data.
_Avoid_: Media, upload

## Relationships

- A **User** owns zero or more **CV Templates**.
- A **User** owns zero or more **Conversion History** records.
- An **Interview Recording** produces exactly one **Conversion History** record when processing succeeds.
- An **Interview Recording** must be deleted from temporary storage before a conversion is shown as complete.
- A **CV Template** can be uploaded, viewed, and deleted by its owning **User**.
- A **CV Template** can be used with a **Conversion History** record to generate a custom CV document.

## Experience principles

- The product should feel like a minimal enterprise SaaS tool: calm, trustworthy, and task-focused.

## Example dialogue

> **Dev:** "When a user uploads a CV template, is it enough to store the file?"
> **Domain expert:** "No. The CV Template must also be registered so it can be selected later when generating a custom CV from Conversion History."

## Flagged ambiguities

- "template" means **CV Template** in this project: a user-owned `.docx` layout for generated CV documents.
