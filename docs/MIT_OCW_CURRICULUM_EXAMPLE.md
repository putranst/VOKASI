# MIT OCW-Standard Curriculum Example
## Cybersecurity Fundamentals - Enterprise-Grade Output

---

## COMPARISON: Current vs MIT OCW Standard

### Current Output (What You Have Now)

```
Module 1: Foundations of Cybersecurity
├── Description: "Core principles and fundamentals of cybersecurity"
├── Subtopics:
│   ├── Key Principles
│   ├── Historical Context
│   └── Core Terminology
└── (No readings, no assessments, no schedule)
```

### MIT OCW Standard Output (Enterprise Grade)

```
Week 1: Foundations of Cybersecurity
├── Learning Objectives (Bloom's Taxonomy):
│   ├── L1 (Remember): Define the CIA Triad and identify its components
│   ├── L2 (Understand): Explain how threat actors exploit vulnerabilities
│   └── L3 (Apply): Classify security incidents using NIST taxonomy
│
├── Schedule:
│   ├── Monday (90 min)
│   │   ├── [LECTURE] Introduction to Cybersecurity Landscape (45 min)
│   │   ├── [DISCUSSION] Case Study: SolarWinds Breach (20 min)
│   │   └── [REFLECTION] Security in Your Daily Life (25 min)
│   │
│   └── Thursday (120 min)
│       ├── [DEMO] Wireshark Network Analysis (30 min)
│       ├── [LAB] Capture and Analyze Network Traffic (60 min)
│       └── [QUIZ] Knowledge Check: Security Fundamentals (30 min)
│
├── Readings:
│   ├── Required: NIST Cybersecurity Framework v2.0, Chapters 1-2
│   ├── Required: "Threat Modeling" by Adam Shostack, pp. 1-40
│   └── Optional: MIT CSAIL Paper on Zero-Trust Architecture
│
├── Assignments:
│   └── Assignment 1: Threat Landscape Analysis (Due: Week 2)
│       ├── Weight: 10% of final grade
│       ├── Deliverable: 2-page threat analysis report
│       └── Rubric:
│           ├── Threat Identification (30%)
│           ├── Risk Assessment (30%)
│           ├── Mitigation Strategies (25%)
│           └── Writing Quality (15%)
│
├── SFIA Competency Mapping:
│   ├── SCTY (Information Security): Level 2 - Working knowledge
│   └── THIN (Security Threat Intelligence): Level 1 - Awareness
│
└── Instructor Notes:
    ├── Common Misconception: Students confuse authentication vs authorization
    ├── Teaching Tip: Use Netflix's Chaos Monkey as engagement hook
    └── Differentiation: Advanced students can explore CVE database
```

---

## Full 4-Week Syllabus Example

### Course: T6-CYB-101 Cybersecurity Fundamentals

**Tagline:** Master the art of digital defense through hands-on, real-world scenarios

**Credits:** 3 | **Level:** Intermediate | **Prerequisites:** Basic networking, Linux CLI

---

### Learning Outcomes (Program-Level)

| ID | Objective | Bloom's Level | Assessment |
|----|-----------|---------------|------------|
| LO1 | Identify and classify common cybersecurity threats and vulnerabilities | Analyze | Quiz, Assignment 1 |
| LO2 | Apply the NIST Cybersecurity Framework to organizational contexts | Apply | Case Study |
| LO3 | Design and implement basic security controls for network protection | Create | Capstone Project |
| LO4 | Evaluate security incidents and propose remediation strategies | Evaluate | Incident Response Lab |
| LO5 | Demonstrate ethical hacking techniques in controlled environments | Apply | Penetration Testing Lab |

---

### Week 1: Immerse - Understanding the Threat Landscape
**IRIS Phase:** Immerse | **CDIO Phase:** Conceive

#### Learning Goals
- [ ] Understand the CIA Triad and its application
- [ ] Map the current threat landscape (ransomware, APTs, phishing)
- [ ] Identify key stakeholders in organizational security

#### Session Plan

| Time | Type | Activity | Materials |
|------|------|----------|-----------|
| 0:00-0:45 | EXPLAIN | Lecture: The Cybersecurity Landscape 2024 | Slides, NIST Framework |
| 0:45-1:05 | DISCUSS | Case Study: Colonial Pipeline Attack | Discussion prompts |
| 1:05-1:30 | REFLECT | Personal Security Audit | Self-assessment worksheet |
| 1:30-2:00 | DEMO | Wireshark: Your First Packet Capture | Lab environment |
| 2:00-3:00 | PRACTICE | Lab: Network Traffic Analysis | Guided lab instructions |

#### Required Readings
1. NIST Cybersecurity Framework v2.0 - Core document, pp. 1-25
2. "Security Engineering" by Ross Anderson - Chapter 1
3. MIT CSAIL Research Brief - Zero Trust Architecture Overview

#### Assignment
**Assignment 1: Organizational Threat Assessment** (Due: Week 2)
- Analyze a real organization's security posture
- Identify top 5 threat vectors
- Propose initial mitigation strategies
- **Weight:** 15% | **Format:** 3-page report + presentation

---

### Week 2: Realize - Security Frameworks & Architecture
**IRIS Phase:** Realize | **CDIO Phase:** Design

#### Session Plan

| Time | Type | Activity | Materials |
|------|------|----------|-----------|
| 0:00-0:30 | EXPLAIN | Framework Deep Dive: NIST CSF | Framework mapping template |
| 0:30-1:00 | COLLABORATE | Group Activity: Framework Selection | Scenario cards |
| 1:00-1:30 | EXPLAIN | Network Security Architecture | Architecture diagrams |
| 1:30-2:15 | PRACTICE | Lab: Firewall Configuration | pfSense VM |
| 2:15-2:45 | QUIZ | Framework Knowledge Check | Online quiz |
| 2:45-3:00 | REFLECT | Gap Analysis: Current vs. Ideal | Reflection template |

#### Assignment
**Assignment 2: Security Architecture Design** (Due: Week 3)
- Design network architecture for SMB scenario
- Include firewall rules, VLAN segmentation, DMZ
- **Weight:** 20%

---

### Week 3: Iterate - Offensive Security & Testing
**IRIS Phase:** Iterate | **CDIO Phase:** Implement

#### Lab Environment
```yaml
Tools Provided:
  - Kali Linux 2024.1
  - Nmap, Nikto, Burp Suite Community
  - Metasploit Framework
  - OWASP ZAP

Target Machines:
  - DVWA (Damn Vulnerable Web Application)
  - Metasploitable 3
  - OWASP Juice Shop
```

#### Assignment
**Assignment 3: Penetration Test Report** (Due: Week 4)
- Conduct authorized pentest on provided target
- Document findings using CVSS scoring
- **Weight:** 25%

---

### Week 4: Scale - Defense & Incident Response
**IRIS Phase:** Scale | **CDIO Phase:** Operate

#### SFIA Competency Achievement
```
By completion, students will demonstrate:

┌─────────────────────────────────────────────────────────────┐
│ SFIA Skill: Information Security (SCTY)                     │
│ Target Level: 3 (Apply)                                     │
│ Evidence: Penetration test report, security architecture    │
├─────────────────────────────────────────────────────────────┤
│ SFIA Skill: Vulnerability Assessment (VUAS)                 │
│ Target Level: 2 (Assist)                                    │
│ Evidence: Vulnerability scan execution and analysis         │
└─────────────────────────────────────────────────────────────┘
```

---

### Capstone Project

**Title:** Enterprise Security Assessment & Hardening

#### Deliverables

| Deliverable | Due | Weight |
|-------------|-----|--------|
| Project Charter & Scope | Week 1 | 10% |
| Vulnerability Assessment Report | Week 2 | 25% |
| Security Architecture Design | Week 3 | 30% |
| Final Implementation & Presentation | Week 4 | 35% |

#### Rubric

| Criterion | Excellent (4) | Proficient (3) | Developing (2) | Beginning (1) |
|-----------|---------------|----------------|----------------|---------------|
| Technical Depth | Comprehensive analysis with novel insights | Thorough analysis | Basic analysis | Superficial |
| Methodology | Follows industry frameworks flawlessly | Applies frameworks appropriately | Some framework application | Minimal |
| Communication | Executive-ready documentation | Professional quality | Adequate clarity | Unclear |
| Innovation | Creative solutions beyond requirements | Solid implementation | Meets minimum | Incomplete |

---

### Instructor Notes

#### Common Student Challenges
1. Confusion: Authentication vs Authorization - Use the bouncer analogy
2. Difficulty: Network packet analysis - Start with HTTP, not encrypted traffic
3. Ethics concern: "Am I really allowed to do this?" - Emphasize authorization

#### Differentiation
| Student Level | Accommodation |
|---------------|---------------|
| Struggling | Pair with mentor, provide step-by-step lab guides |
| On-track | Standard curriculum with optional challenges |
| Advanced | CTF challenges, independent research project |

---

## Summary: What Makes This "Enterprise-Grade"

| Feature | Current | MIT OCW Standard |
|---------|---------|------------------|
| Learning Objectives | Generic description | Bloom's Taxonomy verbs, measurable |
| Schedule | None | Minute-by-minute session plan |
| Activity Types | Basic topics | 7 types (EXPLAIN, DISCUSS, PRACTICE, QUIZ, DEMO, REFLECT, COLLABORATE) |
| Readings | None | Required + Optional with page numbers |
| Assignments | Basic mention | Full rubric, weights, deliverables |
| Competency Mapping | None | SFIA skills with target levels |
| Resources | None | Books, tools, software, VMs |
| Instructor Support | None | Teaching tips, common misconceptions, differentiation |
| Assessment | None | Formative + Summative, clear weights |
| Capstone | Basic | Phased deliverables with rubric |
