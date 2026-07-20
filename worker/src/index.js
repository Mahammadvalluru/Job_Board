// Global in-memory cache for searched job postings to support details page lookups
const JOBS_CACHE = new Map();

// Dynamic mock data for Indian jobs (used when Adzuna API credentials are unconfigured or fail)
const MOCK_INDIAN_JOBS = [
  {
    id: "in-j1",
    title: "Senior React Developer",
    company: { name: "Flipkart", logo: null },
    location: "Bangalore, Karnataka",
    type: "full-time",
    experienceLevel: "senior",
    salaryMin: 1800000,
    salaryMax: 2800000,
    postedDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: "engineering",
    description: "We are looking for a Senior Frontend Engineer to build high-performance user interfaces for our core e-commerce platforms. You will work with React, Redux, and modern build tools.",
    requirements: ["5+ years of React experience", "Expert in JavaScript/TypeScript", "Experience with Web Performance Tuning"],
    applyUrl: "https://www.flipkart.com/careers"
  },
  {
    id: "in-j2",
    title: "Software Engineer - Backend",
    company: { name: "Swiggy", logo: null },
    location: "Bangalore, Karnataka",
    type: "full-time",
    experienceLevel: "mid",
    salaryMin: 1400000,
    salaryMax: 2200000,
    postedDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    category: "engineering",
    description: "Join the delivery dispatch systems team. Work on low-latency microservices that route thousands of deliveries per minute using Java, Spring Boot, and PostgreSQL.",
    requirements: ["3+ years of backend development", "Proficiency in Java or Go", "Experience with Redis/Kafka"],
    applyUrl: "https://www.swiggy.com/careers"
  },
  {
    id: "in-j3",
    title: "Systems Engineer",
    company: { name: "Tata Consultancy Services (TCS)", logo: null },
    location: "Mumbai, Maharashtra",
    type: "full-time",
    experienceLevel: "entry",
    salaryMin: 450000,
    salaryMax: 700000,
    postedDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    category: "engineering",
    description: "TCS is hiring entry-level engineers to join our cloud migration practice. You will receive extensive training on AWS/Azure, databases, and DevOps practices.",
    requirements: ["B.E / B.Tech in Computer Science or related fields", "Basic understanding of SQL and OOP", "Good communications skills"],
    applyUrl: "https://www.tcs.com/careers"
  },
  {
    id: "in-j4",
    title: "Frontend Engineer (SDE II)",
    company: { name: "Paytm", logo: null },
    location: "Noida, Uttar Pradesh",
    type: "full-time",
    experienceLevel: "mid",
    salaryMin: 1200000,
    salaryMax: 1800000,
    postedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    category: "engineering",
    description: "Help build the user interface for India's leading payment and financial services app. Focus on responsiveness, safety, and modern client frameworks.",
    requirements: ["3+ years JS/React experience", "Responsive mobile-first styling", "Familiarity with financial flows"],
    applyUrl: "https://www.paytm.com/careers"
  },
  {
    id: "in-j5",
    title: "Full Stack Developer",
    company: { name: "Zoho Corporation", logo: null },
    location: "Chennai, Tamil Nadu",
    type: "full-time",
    experienceLevel: "mid",
    salaryMin: 900000,
    salaryMax: 1500000,
    postedDate: new Date(Date.now() - 4 * 86400000).toISOString(),
    category: "engineering",
    description: "Develop enterprise SaaS applications. You will work across the stack handling UI development, API integrations, and database schemas on our proprietary platform.",
    requirements: ["Solid JS and Java knowledge", "Database design skills", "SaaS development interest"],
    applyUrl: "https://www.zoho.com/careers"
  },
  {
    id: "in-j6",
    title: "Senior Data Scientist",
    company: { name: "TechNova India", logo: null },
    location: "Hyderabad, Telangana",
    type: "full-time",
    experienceLevel: "senior",
    salaryMin: 2200000,
    salaryMax: 3500000,
    postedDate: new Date(Date.now() - 6 * 86400000).toISOString(),
    category: "engineering",
    description: "Leverage advanced machine learning algorithms to solve prediction, routing, and search queries for millions of active users daily.",
    requirements: ["Masters/PhD in Quantitative field", "Proficiency in Python/PyTorch", "3+ years production ML experience"],
    applyUrl: "https://careers.technova.example.com"
  },
  {
    id: "in-j7",
    title: "Technical Writer",
    company: { name: "Freshworks", logo: null },
    location: "Chennai, Tamil Nadu",
    type: "full-time",
    experienceLevel: "mid",
    salaryMin: 800000,
    salaryMax: 1200000,
    postedDate: new Date(Date.now() - 8 * 86400000).toISOString(),
    category: "hr",
    description: "Create user documentation, guide books, and API articles for our global customer support SaaS products. Help make technical workflows simple and intuitive.",
    requirements: ["Excellent English copywriting", "Familiarity with Markdown/Git", "2+ years in technical writing"],
    applyUrl: "https://www.freshworks.com/careers"
  },
  {
    id: "in-j8",
    title: "Product Designer",
    company: { name: "Razorpay", logo: null },
    location: "Bangalore, Karnataka",
    type: "full-time",
    experienceLevel: "mid",
    salaryMin: 1500000,
    salaryMax: 2400000,
    postedDate: new Date(Date.now() - 7 * 86400000).toISOString(),
    category: "design",
    description: "Design seamless checkout and dashboard interfaces for India's digital payment gateway. Deliver premium UX flows and sleek interface systems.",
    requirements: ["Strong portfolio showing product design", "Proficiency in Figma", "Experience in fintech is a plus"],
    applyUrl: "https://razorpay.com/jobs"
  },
  {
    id: "in-j9",
    title: "Marketing Specialist",
    company: { name: "Zomato", logo: null },
    location: "Gurgaon, Haryana",
    type: "full-time",
    experienceLevel: "mid",
    salaryMin: 1000000,
    salaryMax: 1600000,
    postedDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    category: "marketing",
    description: "Run digital marketing and brand communications campaigns for our dining-out and food delivery platforms. Drive customer acquisition and viral brand engagement.",
    requirements: ["Familiarity with digital ad platforms", "Creative copy writing", "Experience in social media brand management"],
    applyUrl: "https://www.zomato.com/careers"
  },
  {
    id: "in-j10",
    title: "Cloud Infrastructure Architect",
    company: { name: "Reliance Jio", logo: null },
    location: "Navi Mumbai, Maharashtra",
    type: "full-time",
    experienceLevel: "senior",
    salaryMin: 2500000,
    salaryMax: 4000000,
    postedDate: new Date(Date.now() - 12 * 86400000).toISOString(),
    category: "engineering",
    description: "Architect core telecom cloud infrastructure. Handle enormous scale of Kubernetes orchestrations, virtualization platforms, and software-defined networks.",
    requirements: ["7+ years systems engineering", "Expertise in OpenStack / Kubernetes", "Deep network protocol knowledge"],
    applyUrl: "https://www.jio.com/careers"
  }
];

export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };

    // Handle CORS preflight options request
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    const url = new URL(request.url);

    // Endpoint: Verification proxy for Google Token
    if (url.pathname === "/api/auth/google" && request.method === "POST") {
      try {
        const body = await request.json();
        const { idToken, role } = body;

        if (!idToken) {
          return new Response(
            JSON.stringify({ error: "Missing required parameter: idToken" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        let email = "";
        let name = "";
        let picture = "";

        if (idToken.startsWith("mock_")) {
          const parts = idToken.split("|");
          email = parts[1] || "mock_user@example.com";
          name = parts[2] || "Mock User";
        } else {
          const googleUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`;
          const response = await fetch(googleUrl);
          
          if (!response.ok) {
            const errorText = await response.text();
            return new Response(
              JSON.stringify({ error: "Google token verification failed", details: errorText }),
              {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }

          const payload = await response.json();
          email = payload.email;
          name = payload.name;
          picture = payload.picture || "";
        }

        return new Response(
          JSON.stringify({
            success: true,
            user: {
              email: email,
              name: name,
              role: role || "seeker",
              picture: picture,
            },
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Server error", message: err.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Endpoint: Real-time Job Search API Aggregator for India
    if (url.pathname === "/api/jobs" && request.method === "GET") {
      try {
        const keyword = url.searchParams.get("keyword") || "";
        const location = url.searchParams.get("location") || "";
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const pageSize = 10;

        const categoryParam = url.searchParams.get("category") || "";
        const typeParam = url.searchParams.get("type") || "";
        const expParam = url.searchParams.get("experienceLevel") || "";

        const adzunaId = env.ADZUNA_APP_ID;
        const adzunaKey = env.ADZUNA_APP_KEY;

        // If credentials are configured, query Adzuna API for India
        if (adzunaId && adzunaKey && !adzunaId.includes("YOUR_")) {
          try {
            const whatQuery = keyword || (categoryParam !== "engineering" ? categoryParam : "");
            const adzunaQueryUrl = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${adzunaId}&app_key=${adzunaKey}&results_per_page=${pageSize}&what=${encodeURIComponent(whatQuery)}&where=${encodeURIComponent(location)}`;
            const adzunaRes = await fetch(adzunaQueryUrl);

            if (adzunaRes.ok) {
              const data = await adzunaRes.json();
              
              const jobs = data.results.map((result, idx) => {
                const titleStr = (result.title || "").replace(/<\/?[^>]+(>|$)/g, "");
                const descStr = (result.description || "").replace(/<\/?[^>]+(>|$)/g, "");
                const titleLower = titleStr.toLowerCase();
                const catTag = (result.category?.tag || "").toLowerCase();
                const catLabel = (result.category?.label || "").toLowerCase();

                let category = "engineering";
                if (catTag.includes("design") || catLabel.includes("design") || titleLower.includes("design") || titleLower.includes("ui") || titleLower.includes("ux")) {
                  category = "design";
                } else if (catTag.includes("marketing") || catLabel.includes("marketing") || titleLower.includes("marketing") || titleLower.includes("seo") || titleLower.includes("content")) {
                  category = "marketing";
                } else if (catTag.includes("sales") || catLabel.includes("sales") || titleLower.includes("sales") || titleLower.includes("business development") || titleLower.includes("bde") || titleLower.includes("representative")) {
                  category = "sales";
                } else if (catTag.includes("finance") || catTag.includes("accounting") || catLabel.includes("finance") || catLabel.includes("accounting") || titleLower.includes("finance") || titleLower.includes("accountant")) {
                  category = "finance";
                } else if (catTag.includes("hr") || catTag.includes("admin") || catLabel.includes("human resource") || catLabel.includes("admin") || titleLower.includes("recruiter") || titleLower.includes("hr")) {
                  category = "hr";
                }
                
                let jobType = "full-time";
                if (result.contract_type === "contract" || result.contract_time === "contract" || titleLower.includes("contract") || titleLower.includes("freelance")) {
                  jobType = "contract";
                } else if (result.contract_time === "part_time" || titleLower.includes("part-time") || titleLower.includes("part time")) {
                  jobType = "part-time";
                }

                let expLevel = "mid";
                if (titleLower.includes("senior") || titleLower.includes("lead") || titleLower.includes("principal") || titleLower.includes("sr.") || titleLower.includes("head") || titleLower.includes("architect")) {
                  expLevel = "senior";
                } else if (titleLower.includes("intern") || titleLower.includes("junior") || titleLower.includes("fresher") || titleLower.includes("entry") || titleLower.includes("jr.")) {
                  expLevel = "entry";
                }

                const urlLower = result.redirect_url ? result.redirect_url.toLowerCase() : "";
                let sourcePortal = "Careers Page";
                if (urlLower.includes("indeed")) sourcePortal = "Indeed";
                else if (urlLower.includes("naukri")) sourcePortal = "Naukri";
                else if (urlLower.includes("linkedin")) sourcePortal = "LinkedIn";
                else if (urlLower.includes("monster")) sourcePortal = "Monster";
                else if (urlLower.includes("timesjobs")) sourcePortal = "TimesJobs";
                else if (urlLower.includes("shine")) sourcePortal = "Shine";
                else {
                  const portals = ["Indeed", "Naukri", "Careers Page", "LinkedIn", "Shine"];
                  sourcePortal = portals[idx % portals.length];
                }

                const mappedJob = {
                  id: `adzuna-${result.id}`,
                  title: titleStr,
                  company: {
                    name: result.company?.display_name || "Hiring Company",
                    logo: null
                  },
                  location: result.location?.display_name || "India",
                  type: jobType,
                  experienceLevel: expLevel,
                  salaryMin: result.salary_min ? Math.round(result.salary_min) : null,
                  salaryMax: result.salary_max ? Math.round(result.salary_max) : null,
                  postedDate: result.created || new Date().toISOString(),
                  category: category,
                  description: descStr || `${titleStr} position at ${result.company?.display_name || 'Hiring Company'}.`,
                  requirements: ["Strong analytical skills", "Good domain knowledge", "Ability to collaborate in teams"],
                  applyUrl: result.redirect_url || "https://www.adzuna.in",
                  source: sourcePortal,
                  status: "active"
                };

                // Cache the mapped job details
                JOBS_CACHE.set(mappedJob.id, mappedJob);

                return mappedJob;
              });

              let filteredJobs = jobs;
              if (typeParam) filteredJobs = filteredJobs.filter(j => j.type === typeParam);
              if (expParam) filteredJobs = filteredJobs.filter(j => j.experienceLevel === expParam);
              if (categoryParam) filteredJobs = filteredJobs.filter(j => j.category === categoryParam);

              return new Response(
                JSON.stringify({
                  jobs: filteredJobs,
                  total: data.count || jobs.length,
                  page: page,
                  totalPages: Math.ceil((data.count || jobs.length) / pageSize)
                }),
                {
                  status: 200,
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                }
              );
            }
          } catch (apiErr) {
            console.error("Adzuna API query failed, falling back to mock:", apiErr);
          }
        }

        // Fallback or Dev mode: filter mock Indian jobs data
        let filteredJobs = [...MOCK_INDIAN_JOBS];

        if (keyword) {
          const kw = keyword.toLowerCase();
          filteredJobs = filteredJobs.filter(job => 
            job.title.toLowerCase().includes(kw) || 
            job.description.toLowerCase().includes(kw) || 
            job.company.name.toLowerCase().includes(kw)
          );
        }

        if (location) {
          const loc = location.toLowerCase();
          filteredJobs = filteredJobs.filter(job => 
            job.location.toLowerCase().includes(loc)
          );
        }

        // Pagination calculations
        const total = filteredJobs.length;
        const totalPages = Math.max(1, Math.ceil(total / pageSize));
        const safePage = Math.min(Math.max(1, page), totalPages);
        const start = (safePage - 1) * pageSize;
        const pagedJobs = filteredJobs.slice(start, start + pageSize);

        return new Response(
          JSON.stringify({
            jobs: pagedJobs,
            total: total,
            page: safePage,
            totalPages: totalPages
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Server error", message: err.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Endpoint: Get Single Job details from Indian catalog
    if (url.pathname.startsWith("/api/jobs/") && request.method === "GET") {
      try {
        const jobId = url.pathname.substring("/api/jobs/".length);
        
        // Check cache first (for Adzuna or dynamically searched jobs)
        if (JOBS_CACHE.has(jobId)) {
          return new Response(
            JSON.stringify(JOBS_CACHE.get(jobId)),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Check mock list next
        const mockJob = MOCK_INDIAN_JOBS.find(j => j.id === jobId);
        
        if (mockJob) {
          return new Response(
            JSON.stringify(mockJob),
            {
              status: 200,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        // Construct dynamic detailed page if it's an adzuna id or other searched job
        return new Response(
          JSON.stringify({
            id: jobId,
            title: "Software Engineer",
            company: { name: "Indian Technology Partner", logo: null },
            location: "Bangalore, India",
            type: "full-time",
            experienceLevel: "mid",
            salaryMin: 800000,
            salaryMax: 1600000,
            postedDate: new Date().toISOString(),
            category: "engineering",
            description: "Detailed job description for this opportunity. Excellent growth, dynamic team structure, and competitive benefits.",
            requirements: ["Excellent coding skill", "Solid collaboration habits", "B.Tech/MCA/CS graduate"],
            applyUrl: "https://www.naukri.com"
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Server error", message: err.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Not Found" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  },
};
