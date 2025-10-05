import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to extract emphasis keywords as simple array
function getEmphasisKeywords(
  emphasisAreas?: { name: string; level: number; apply_to: string[] }[],
  section?: 'projects' | 'experience'
): string[] {
  if (!emphasisAreas || emphasisAreas.length === 0) return [];
  
  const relevantAreas = section 
    ? emphasisAreas.filter(area => area.apply_to.includes(section))
    : emphasisAreas;
  
  return relevantAreas.map(area => area.name.trim()).filter(Boolean);
}

export async function generateResumeFeedbackFull(
  resumeText: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  customRequirements?: string,
  emphasisAreas?: { name: string; level: number; apply_to: string[] }[]
) {
  const emphasisKeywords = getEmphasisKeywords(emphasisAreas);
  const hasValidEmphasis = emphasisKeywords.length > 0;
  
  // If user specified emphasis areas, use structured approach
  if (hasValidEmphasis) {
    const prompt = `You are an elite resume writer. The user wants their resume to focus on these specific areas: ${emphasisKeywords.join(', ')}.

RESUME TEXT:
${resumeText}

TARGET JOB:
- Company: ${companyName}
- Position: ${jobTitle}
- Job Description: ${jobDescription}
${customRequirements ? `- Additional Requirements: ${customRequirements}` : ''}

Generate 3 sections. For EACH section, you MUST use the emphasis areas [${emphasisKeywords.join(', ')}].

SECTION 1 - PROJECT SUGGESTIONS:
For each of the 3 projects:
1. Pick at least 2 emphasis areas from [${emphasisKeywords.join(', ')}]
2. Build a project that DIRECTLY uses/demonstrates those areas
3. The project title must reference at least one emphasis area
4. Every resume bullet must mention specific technologies/frameworks from the emphasis areas

Format each project as:

**Project [number]: [Title that includes emphasis area]**

[2-3 sentences describing the project - must mention emphasis areas]

**Why this matters for ${companyName}:**
[Brief explanation]

**Resume Bullets:**
Write 3-4 bullets (1.5-2 lines each). EACH bullet must:
- Start with action verb
- Explicitly mention at least one emphasis area: ${emphasisKeywords.join(', ')}
- Include metrics
- Format: "[Verb] [what you did with EMPHASIS AREA] using [specific tech from emphasis] to [impact + metrics]"

---

SECTION 2 - EXPERIENCE ENHANCEMENT:
Look at their current resume. Rewrite 3-4 bullets to explicitly include the emphasis areas.

INSTRUCTIONS:
1. For EACH bullet, select 1-2 emphasis areas from [${emphasisKeywords.join(', ')}]
2. Transform the original work to showcase those areas
3. Add specific details/technologies related to the emphasis areas
4. Include metrics

You MUST mention at least one of [${emphasisKeywords.join(', ')}] in EACH bullet explicitly.

Format as:

**Enhanced Experience Bullets:**

- [Rewritten bullet 1 - must contain emphasis keywords: ${emphasisKeywords.join(', ')}]

- [Rewritten bullet 2 - must contain emphasis keywords: ${emphasisKeywords.join(', ')}]

- [Rewritten bullet 3 - must contain emphasis keywords: ${emphasisKeywords.join(', ')}]

---

SECTION 3 - ALTERNATIVE COMPANIES:
List 10 companies (NOT FAANG) that value these emphasis areas: ${emphasisKeywords.join(', ')}.

Format:
1. [Company Name]
2. [Company Name]
...
10. [Company Name]

---

Return ONLY valid JSON:
{
  "project_suggestions": "markdown string with all 3 projects",
  "experience_tweaks": "markdown string with enhanced bullets only",
  "company_matches": "markdown string with numbered list"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You must incorporate these exact terms in your output: ${emphasisKeywords.join(', ')}. 

Every bullet point you write must mention at least one of these terms explicitly. Not conceptually - the actual words must appear.

If you write a bullet that doesn't contain these terms, you have failed the task.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from OpenAI');
    return JSON.parse(content);
  }

  // No emphasis areas - use generic approach
  const prompt = `You are an elite resume writer with 15+ years of experience.

RESUME TEXT:
${resumeText}

TARGET JOB:
- Company: ${companyName}
- Position: ${jobTitle}
- Job Description: ${jobDescription}
${customRequirements ? `- Additional Requirements: ${customRequirements}` : ''}

Provide feedback in these three sections:

1. PROJECT SUGGESTIONS (project_suggestions):
Generate 3 projects for ${companyName}. For each provide:
- Project title and description (2-3 sentences)
- Why it matters for ${companyName}
- 3-4 dense resume bullets with action verbs, specific technologies, and metrics

2. EXPERIENCE ENHANCEMENT (experience_tweaks):
Rewrite 3-4 bullets from their resume to be more compelling for ${companyName}.
- Add metrics
- Include specific technologies
- Show business impact
Format as bulleted list only.

3. ALTERNATIVE COMPANIES (company_matches):
List 10 companies (NOT FAANG) as numbered list.

Return ONLY valid JSON:
{
  "project_suggestions": "markdown formatted string",
  "experience_tweaks": "markdown formatted string",
  "company_matches": "markdown formatted string"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an elite resume writer. Be thorough and professional.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');
  return JSON.parse(content);
}

async function generateProjectSuggestions(
  resumeText: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  emphasisAreas?: { name: string; level: number; apply_to: string[] }[]
) {
  const emphasisKeywords = getEmphasisKeywords(emphasisAreas, 'projects');
  const hasValidEmphasis = emphasisKeywords.length > 0;
  
  if (hasValidEmphasis) {
    const prompt = `Generate 3 project suggestions for ${jobTitle} at ${companyName}.

RESUME: ${resumeText}

JOB DESCRIPTION: ${jobDescription}

MANDATORY FOCUS AREAS: ${emphasisKeywords.join(', ')}

INSTRUCTIONS:
For each project:
1. Choose 2-3 focus areas from [${emphasisKeywords.join(', ')}]
2. Create a project that directly uses/demonstrates those areas
3. Project title must include at least one focus area
4. All bullets must explicitly mention the focus areas

Format each project:

**Project [number]: [Title - must reference a focus area]**

[Description mentioning focus areas: ${emphasisKeywords.join(', ')}]

**Why this matters for ${companyName}:**
[Brief explanation]

**Resume Bullets:**
(3-4 bullets, each MUST contain at least one of: ${emphasisKeywords.join(', ')})

- [Action verb] [what you built with FOCUS AREA] using [specific tech] to [impact + metrics]
- [Action verb] [what you built with FOCUS AREA] using [specific tech] to [impact + metrics]
- [Action verb] [what you built with FOCUS AREA] using [specific tech] to [impact + metrics]

Return ONLY valid JSON:
{
  "project_suggestions": "markdown formatted string with all 3 projects"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `The user wants these specific terms in every output: ${emphasisKeywords.join(', ')}

You MUST use these exact words in your project titles and bullets. Check your work - if these terms don't appear, start over.`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from OpenAI');
    return JSON.parse(content);
  }

  // Generic version without emphasis
  const prompt = `Generate 3 project suggestions for ${jobTitle} at ${companyName}.

RESUME: ${resumeText}
JOB DESCRIPTION: ${jobDescription}

For each project provide title, description, why it matters, and 3-4 resume bullets with metrics.

Return ONLY valid JSON:
{ "project_suggestions": "markdown formatted string" }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'Generate project suggestions.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');
  return JSON.parse(content);
}

// NEW: Regenerate from scratch when emphasis areas added after initial generation
async function regenerateProjectsWithEmphasis(
  resumeText: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  emphasisKeywords: string[]
) {
  const prompt = `REGENERATE project suggestions from scratch focusing on: ${emphasisKeywords.join(', ')}.

IGNORE any previous project suggestions. Start fresh.

RESUME: ${resumeText}
TARGET: ${jobTitle} at ${companyName}
JOB DESCRIPTION: ${jobDescription}

REQUIRED FOCUS: ${emphasisKeywords.join(', ')}

Create 3 COMPLETELY NEW projects that showcase these focus areas. Each project MUST:
- Have a title that includes one focus area
- Use 2-3 of the focus areas: ${emphasisKeywords.join(', ')}
- Have bullets that explicitly mention these terms

Format:

**Project 1: [Title with focus area]**
[Description using: ${emphasisKeywords.join(', ')}]

**Why this matters for ${companyName}:**
[Explanation]

**Resume Bullets:**
- [Must contain: ${emphasisKeywords.join(' or ')}] with metrics
- [Must contain: ${emphasisKeywords.join(' or ')}] with metrics
- [Must contain: ${emphasisKeywords.join(' or ')}] with metrics

[Repeat for Projects 2 and 3]

Return ONLY valid JSON:
{ "project_suggestions": "markdown string" }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Create NEW projects from scratch that prominently feature: ${emphasisKeywords.join(', ')}. These terms must appear in titles and bullets.`
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.75,
    max_tokens: 4000,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');
  return JSON.parse(content);
}

async function generateExperienceEnhancements(
  resumeText: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  emphasisAreas?: { name: string; level: number; apply_to: string[] }[]
) {
  const emphasisKeywords = getEmphasisKeywords(emphasisAreas, 'experience');
  const hasValidEmphasis = emphasisKeywords.length > 0;
  
  if (hasValidEmphasis) {
    const prompt = `CREATE 3-4 brand new experience bullets for ${jobTitle} at ${companyName}.

CONTEXT (understand their level):
${resumeText}

JOB DESCRIPTION: ${jobDescription}

FOCUS AREAS: ${emphasisKeywords.join(', ')}

CRITICAL INSTRUCTION:
Create ONE cohesive project/experience that naturally incorporates the focus areas: ${emphasisKeywords.join(', ')}

Then write 3-4 bullets that describe DIFFERENT ASPECTS of that project:
- Bullet 1: Focus on the architecture/design (mention some focus areas)
- Bullet 2: Focus on implementation/optimization (mention different focus areas)
- Bullet 3: Focus on results/impact (weave in remaining focus areas naturally)
- Bullet 4: Focus on collaboration/deployment (if relevant)

DO NOT repeat the same keywords in every bullet. Distribute them naturally across bullets.
DO NOT force all keywords into every bullet - that's repetitive and unnatural.

Example for focus areas "React, Node.js, PostgreSQL, AWS":
✅ GOOD (varied, natural):
- Architected full-stack e-commerce platform using React and Node.js microservices, handling 50K+ concurrent users
- Optimized PostgreSQL database queries and implemented Redis caching, reducing API response time by 65%
- Deployed serverless infrastructure on AWS Lambda and ECS, cutting hosting costs by $15K/month
- Led team of 4 engineers through agile sprints, delivering features 40% faster than previous quarter

❌ BAD (repetitive, keyword stuffing):
- Built React and Node.js platform with PostgreSQL and AWS, handling 50K users
- Developed React frontend with Node.js backend using PostgreSQL database on AWS infrastructure
- Created React components with Node.js APIs connected to PostgreSQL running on AWS

Your turn - create ONE cohesive project using: ${emphasisKeywords.join(', ')}

Format:

**Enhanced Experience Bullets:**

- [Bullet 1 - architecture/design aspect]

- [Bullet 2 - implementation/optimization aspect]

- [Bullet 3 - results/impact aspect]

- [Bullet 4 - collaboration/deployment aspect (optional)]

Return ONLY valid JSON:
{
  "experience_tweaks": "markdown formatted string"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `CREATE a cohesive project narrative using: ${emphasisKeywords.join(', ')}

Write bullets that describe DIFFERENT ASPECTS of the same project. DO NOT repeat all keywords in every bullet - that's unnatural. Distribute them across bullets naturally.

Think: What would this project actually involve? What are its different components?`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.85,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('No response from OpenAI');
    return JSON.parse(content);
  }

  // Generic version - still create new bullets, not enhance existing
  const prompt = `CREATE 3-4 new experience bullets for ${jobTitle} at ${companyName}.

CONTEXT (understand their level):
${resumeText}

JOB DESCRIPTION: ${jobDescription}

INVENT one cohesive project. Write bullets describing different aspects:
- Architecture/design
- Implementation/optimization  
- Results/impact
- Collaboration (if relevant)

Include specific technologies and metrics. Make bullets 1.5-2 lines each.

Return ONLY valid JSON:
{ "experience_tweaks": "markdown formatted string" }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'CREATE new impressive resume bullets about ONE cohesive project. Each bullet = different aspect.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.85,
    max_tokens: 3000,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');
  return JSON.parse(content);
}

// NEW: Regenerate from scratch when emphasis areas added after initial generation
async function regenerateExperienceWithEmphasis(
  resumeText: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  emphasisKeywords: string[]
) {
  const prompt = `CREATE 3-4 experience bullets for ONE cohesive project using: ${emphasisKeywords.join(', ')}.

CONTEXT:
${resumeText}

TARGET: ${jobTitle} at ${companyName}
JOB DESCRIPTION: ${jobDescription}

FOCUS: ${emphasisKeywords.join(', ')}

INSTRUCTIONS:
Think of ONE impressive project that naturally uses these technologies: ${emphasisKeywords.join(', ')}

Then write 3-4 bullets describing DIFFERENT ASPECTS of that single project:
1. Architecture/system design
2. Core implementation/optimization
3. Results/business impact
4. Team collaboration/deployment

DO NOT stuff all keywords into every bullet. Distribute them naturally.

Example for "C++, CUDA, SLAM":

✅ GOOD (cohesive story, varied):
- Architected real-time SLAM pipeline for autonomous navigation using C++, processing LiDAR point clouds at 30Hz with sub-centimeter accuracy
- Optimized pose estimation algorithms with CUDA, achieving 5x speedup in particle filter computations and enabling real-time mapping
- Deployed system on embedded hardware running proprietary C++ framework, reducing memory footprint by 40% while maintaining performance
- Integrated mapping module with navigation stack, enabling robots to autonomously explore 10,000+ sq ft environments

❌ BAD (repetitive keyword stuffing):
- Built C++ SLAM system with CUDA achieving real-time performance
- Developed CUDA-accelerated SLAM in C++ for robot navigation  
- Implemented C++ and CUDA SLAM algorithm for autonomous systems
- Created SLAM pipeline using C++ and CUDA acceleration

Your turn with: ${emphasisKeywords.join(', ')}

Format:

**Enhanced Experience Bullets:**

- [Bullet 1 - architecture/design]
- [Bullet 2 - implementation/optimization]
- [Bullet 3 - results/impact]
- [Bullet 4 - collaboration/deployment]

Return ONLY valid JSON:
{ "experience_tweaks": "markdown string" }`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `Create ONE cohesive project using: ${emphasisKeywords.join(', ')}

Each bullet describes a DIFFERENT ASPECT. Don't repeat keywords - distribute them naturally across the narrative.`
      },
      { role: 'user', content: prompt }
    ],
    temperature: 0.9,
    max_tokens: 3000,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');
  return JSON.parse(content);
}

async function generateCompanyMatches(
  resumeText: string,
  jobTitle: string,
  companyName: string,
  emphasisAreas?: { name: string; level: number; apply_to: string[] }[]
) {
  const emphasisKeywords = getEmphasisKeywords(emphasisAreas);
  const hasValidEmphasis = emphasisKeywords.length > 0;
  
  const emphasisClause = hasValidEmphasis
    ? `\n\nFocus on companies working with: ${emphasisKeywords.join(', ')}`
    : '';

  const prompt = `Suggest 10 companies (NOT FAANG: no Google, Meta, Amazon, Apple, Microsoft) for someone targeting ${jobTitle} at ${companyName}.

RESUME SUMMARY:
${resumeText.substring(0, 2000)}
${emphasisClause}

Return as a markdown formatted numbered list. Each company on its own line.

Format EXACTLY like this:
1. Company Name One
2. Company Name Two
3. Company Name Three
4. Company Name Four
5. Company Name Five
6. Company Name Six
7. Company Name Seven
8. Company Name Eight
9. Company Name Nine
10. Company Name Ten

Return ONLY valid JSON:
{
  "company_matches": "1. Company Name\\n2. Company Name\\n3. Company Name\\n..."
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'Generate a numbered list of 10 company names in markdown format. Each line should be: "1. Company Name"' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.8,
    max_tokens: 2000,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');
  
  const parsed = JSON.parse(content);
  
  // Ensure it's formatted as a numbered list if the AI returned an array
  if (Array.isArray(parsed.company_matches)) {
    parsed.company_matches = parsed.company_matches
      .map((company: string, index: number) => `${index + 1}. ${company}`)
      .join('\n');
  }
  
  return parsed;
}

export async function generateResumeFeedback(
  resumeText: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string,
  customRequirements?: string,
  emphasisAreas?: { name: string; level: number; apply_to: string[] }[],
  sectionsToGenerate?: string[],
  isRegeneration?: boolean  // NEW: Flag to indicate this is a regeneration after initial generation
) {
  if (!sectionsToGenerate || sectionsToGenerate.length === 3) {
    return generateResumeFeedbackFull(
      resumeText,
      jobTitle,
      companyName,
      jobDescription,
      customRequirements,
      emphasisAreas
    );
  }

  const result: any = {};
  const emphasisKeywords = getEmphasisKeywords(emphasisAreas);
  const hasValidEmphasis = emphasisKeywords.length > 0;

  if (sectionsToGenerate.includes('project_suggestions')) {
    // If regenerating with NEW emphasis areas, use the regenerate function
    if (isRegeneration && hasValidEmphasis) {
      const projectsResponse = await regenerateProjectsWithEmphasis(
        resumeText, jobTitle, companyName, jobDescription, emphasisKeywords
      );
      result.project_suggestions = projectsResponse.project_suggestions;
    } else {
      const projectsResponse = await generateProjectSuggestions(
        resumeText, jobTitle, companyName, jobDescription, emphasisAreas
      );
      result.project_suggestions = projectsResponse.project_suggestions;
    }
  }

  if (sectionsToGenerate.includes('experience_tweaks')) {
    // If regenerating with NEW emphasis areas, use the regenerate function
    if (isRegeneration && hasValidEmphasis) {
      const experienceResponse = await regenerateExperienceWithEmphasis(
        resumeText, jobTitle, companyName, jobDescription, emphasisKeywords
      );
      result.experience_tweaks = experienceResponse.experience_tweaks;
    } else {
      const experienceResponse = await generateExperienceEnhancements(
        resumeText, jobTitle, companyName, jobDescription, emphasisAreas
      );
      result.experience_tweaks = experienceResponse.experience_tweaks;
    }
  }

  if (sectionsToGenerate.includes('company_matches')) {
    const companiesResponse = await generateCompanyMatches(
      resumeText, jobTitle, companyName, emphasisAreas
    );
    result.company_matches = companiesResponse.company_matches;
  }

  return result;
}