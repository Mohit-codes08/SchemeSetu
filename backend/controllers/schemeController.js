const Groq = require("groq-sdk");
let Application;
try {
  Application = require("../models/Application");
} catch (e) {
  console.log("Model load skipped.");
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.matchSchemes = async (req, res) => {
  try {
    const { name, occupation, income, location, category, businessType, language } = req.body;
    const isHindi = language === "hi";

    const prompt = `
You are the official Government of India SchemeSetu AI Advisor.
Evaluate the citizen's eligibility based on real socio-economic rules.

Citizen Profile:
- Name: ${name || "Applicant"}
- Primary Occupation: ${occupation || "Farmer"}
- Annual Household Income: ₹${income || "100000"}
- Location: ${location || "India"}
- Category: ${category || "General"}
- Business Model / Assistance: ${businessType || "Business Expansion"}

Task: Return 3 to 4 best matching central and state schemes in valid JSON format.

JSON Schema format:
{
  "schemes": [
    {
      "name": "Scheme Name",
      "schemeType": "Central",
      "stateName": "All India",
      "icon": "🌾",
      "eligibility": "Reason for eligibility under 20 words.",
      "documents": ["Aadhaar Card", "Income Certificate", "Bank Passbook"],
      "steps": ["Step 1: Apply online", "Step 2: Upload documents", "Step 3: Track status"],
      "officialPortalUrl": "https://www.myscheme.gov.in"
    }
  ]
}
`;

    let schemes = [];

    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      let rawContent = chatCompletion.choices[0]?.message?.content || "{}";
      let parsedData = JSON.parse(rawContent);

      if (Array.isArray(parsedData)) {
        schemes = parsedData;
      } else if (parsedData.schemes && Array.isArray(parsedData.schemes)) {
        schemes = parsedData.schemes;
      } else {
        const firstArr = Object.values(parsedData).find(v => Array.isArray(v));
        schemes = firstArr || [];
      }
    } catch (aiErr) {
      console.log("AI API fallback triggered:", aiErr.message);
    }

    // Bulletproof Fallback: Schemes guarantee agar API latency ho
    if (!schemes || schemes.length === 0) {
      schemes = [
        {
          name: isHindi ? "प्रधानमंत्री विश्वकर्मा योजना (PM Vishwakarma)" : "PM Vishwakarma Scheme",
          schemeType: "Central",
          stateName: "All India",
          icon: "🛠️",
          eligibility: isHindi ? `पारिवारिक आय ₹${income} एवं ${occupation} व्यवसाय हेतु टूलकिट एवं ₹3 लाख तक का रियायती ऋण।` : `Eligible for skill training, toolkit grant of ₹15,000, and low-interest collateral free loans.`,
          documents: ["Aadhaar Card", "Bank Passbook", "Skill Certificate / Self Declaration"],
          steps: [
            isHindi ? "नजदीकी CSC केंद्र या आधिकारिक पोर्टल पर जाएं" : "Visit nearest CSC Centre or official portal",
            isHindi ? "आधार बायोमेट्रिक सत्यापन पूरा करें" : "Complete Aadhaar biometric authentication",
            isHindi ? "टूलकिट ई-वाउचर और ऋण सहायता प्राप्त करें" : "Receive toolkit e-voucher and loan approval"
          ],
          officialPortalUrl: "https://pmvishwakarma.gov.in"
        },
        {
          name: isHindi ? "प्रधानमंत्री मुद्रा योजना (PMMY - Shishu / Kishore)" : "PM Mudra Yojana (PMMY)",
          schemeType: "Central",
          stateName: "All India",
          icon: "💼",
          eligibility: isHindi ? `${businessType || "सूक्ष्म उद्यम"} शुरू करने हेतु ₹50,000 से ₹5,00,000 तक का संपार्श्विक-मुक्त ऋण।` : `Collateral-free enterprise loan up to ₹50,000 to ₹5,00,000 for proposed business setup.`,
          documents: ["Aadhaar Card", "PAN Card", "Business Proposal / Quotation", "Bank Statement"],
          steps: [
            isHindi ? "उद्यमीमित्र पोर्टल (udyamimitra.in) पर आवेदन करें" : "Apply online on UdyamiMitra portal",
            isHindi ? "प्रस्तावित व्यवसाय का विवरण भरें" : "Submit project cost and equipment quotations",
            isHindi ? "बैंक शाखा द्वारा ऋण स्वीकृति प्राप्त करें" : "Bank verifies documents and disburses funds"
          ],
          officialPortalUrl: "https://www.mudra.org.in"
        },
        {
          name: isHindi ? `राज्य सूक्ष्म उद्यम संवर्धन योजना (${location || "State"})` : `State Micro-Enterprise Promotion Scheme`,
          schemeType: "State",
          stateName: location || "State Domicile",
          icon: "🏛️",
          eligibility: isHindi ? `${location} निवासी एवं ${category} श्रेणी के लिए विशेष पूंजीगत ब्याज अनुदान।` : `Special state capital and interest subsidy reserved for ${category} category entrepreneurs.`,
          documents: ["Domicile / Resident Certificate", "Caste Certificate", "Aadhaar Card", "Income Certificate"],
          steps: [
            isHindi ? "राज्य उद्योग प्रोत्साहन पोर्टल पर पंजीकरण करें" : "Register on State Industries & MSME portal",
            isHindi ? "निवास व जाति प्रमाण पत्र संलग्न करें" : "Upload domicile and category certificates",
            isHindi ? "जिला उद्योग केंद्र (DIC) से अनुदान स्वीकृत करवाएं" : "Get subsidy sanctioned from District Industries Centre"
          ],
          officialPortalUrl: "https://msme.gov.in"
        }
      ];
    }

    if (Application) {
      try {
        const newRecord = new Application({
          name,
          occupation,
          income: Number(income),
          location,
          category,
          businessType,
          language: language || "en",
          matchedSchemes: schemes
        });
        await newRecord.save();
      } catch (dbErr) {
        console.log("DB save note:", dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      name: name || "Applicant",
      schemes
    });

  } catch (error) {
    console.error("Match Schemes Error:", error);
    return res.status(500).json({ success: false, message: "AI matching failed", error: error.message });
  }
};