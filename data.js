/* Dhara prototype: all demo data.
   Everything here is fictional: the Act, its sections, the amending Acts,
   the cases, parties, courts' case numbers, dates and figures. */
'use strict';

(function () {
  // Dates relative to today, so the dashboard and calendar always look live.
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const rel = (days, years) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    if (years) d.setFullYear(d.getFullYear() + years);
    d.setDate(d.getDate() + days);
    return iso(d);
  };

  const ACT = {
    id: 'rtda2006',
    title_en: 'Residential Tenancy (Deposit and Notice) Act, 2006',
    title_bn: 'আবাসিক ভাড়া (জামানত ও নোটিশ) আইন, ২০০৬',
    short_en: 'Residential Tenancy Act, 2006',
    short_bn: 'আবাসিক ভাড়া আইন, ২০০৬',
    number: 'Act No. XXI of 2006',
    commenced: '2006-07-01'
  };

  const AMEND_2023 = 'Residential Tenancy (Amendment) Act, 2023 (Act No. XVIII of 2023), section 3';
  const AMEND_2018 = 'Residential Tenancy (Amendment) Act, 2018 (Act No. XII of 2018), section 4';

  /* Section text uses [[key|phrase]] to mark the exact phrase a citation points to. */
  const SECTIONS = {
    s5: {
      id: 's5', num: '5', numBn: '৫', chapter: 'ch2',
      title_en: 'Return of security deposit',
      title_bn: 'জামানত ফেরত',
      lineage: 'high',
      lineageNote: 'Commencement date confirmed from a dated Gazette notification.',
      versions: [
        {
          vid: 'rtda2006/s5@2006-07-01', label: 'Version 1 (as enacted)',
          from: '2006-07-01', to: '2023-12-31',
          short_en: '7 days', short_bn: '৭ দিন',
          facts: { days_en: 'seven', days_bn: 'সাত', days: 7 },
          amendedBy: null,
          footnote: null,
          dateBasis: 'Original text as enacted. In force from 1 July 2006 under section 1(2) of the Act.',
          en: '(1) On the termination of a tenancy, the landlord shall [[ret|return the security deposit to the tenant within seven days]] of the tenant delivering vacant possession of the premises.\n(2) The landlord may [[ded|deduct from the security deposit any rent lawfully due, or the reasonable cost of repairing damage]] caused by the tenant other than ordinary wear and tear, and shall [[stm|give the tenant a written statement of every deduction]].',
          bn: '(১) ভাড়ার মেয়াদ শেষ হইলে, ভাড়াটিয়া কর্তৃক প্রাঙ্গণের খালি দখল হস্তান্তরের [[ret|সাত দিনের মধ্যে বাড়িওয়ালা ভাড়াটিয়াকে জামানতের অর্থ ফেরত দিবেন]]।\n(২) বাড়িওয়ালা [[ded|আইনত পাওনা ভাড়া, অথবা ভাড়াটিয়া কর্তৃক সৃষ্ট ক্ষতি মেরামতের যুক্তিসঙ্গত ব্যয়, জামানত হইতে কর্তন করিতে পারিবেন]], তবে স্বাভাবিক ক্ষয়ক্ষতি ইহার অন্তর্ভুক্ত হইবে না, এবং [[stm|প্রত্যেক কর্তনের লিখিত বিবরণ ভাড়াটিয়াকে প্রদান করিবেন]]।'
        },
        {
          vid: 'rtda2006/s5@2024-01-01', label: 'Version 2 (current)',
          from: '2024-01-01', to: null,
          short_en: '5 days', short_bn: '৫ দিন',
          facts: { days_en: 'five', days_bn: 'পাঁচ', days: 5 },
          changeSummary_en: 'Section 5 was amended with effect from 1 January 2024. The period is now five days, not seven.',
          changeSummary_bn: '১ জানুয়ারি ২০২৪ থেকে ধারা ৫ সংশোধিত হয়েছে। সময়সীমা এখন সাত দিনের পরিবর্তে পাঁচ দিন।',
          amendedBy: AMEND_2023,
          footnote: 'The word “five” was substituted for the word “seven” by section 3 of the Residential Tenancy (Amendment) Act, 2023 (Act No. XVIII of 2023).',
          dateBasis: 'In force from 1 January 2024, from Gazette notification S.R.O. No. 412-Law/2023 dated 18 December 2023.',
          en: '(1) On the termination of a tenancy, the landlord shall [[ret|return the security deposit to the tenant within five days]] of the tenant delivering vacant possession of the premises.\n(2) The landlord may [[ded|deduct from the security deposit any rent lawfully due, or the reasonable cost of repairing damage]] caused by the tenant other than ordinary wear and tear, and shall [[stm|give the tenant a written statement of every deduction]].',
          bn: '(১) ভাড়ার মেয়াদ শেষ হইলে, ভাড়াটিয়া কর্তৃক প্রাঙ্গণের খালি দখল হস্তান্তরের [[ret|পাঁচ দিনের মধ্যে বাড়িওয়ালা ভাড়াটিয়াকে জামানতের অর্থ ফেরত দিবেন]]।\n(২) বাড়িওয়ালা [[ded|আইনত পাওনা ভাড়া, অথবা ভাড়াটিয়া কর্তৃক সৃষ্ট ক্ষতি মেরামতের যুক্তিসঙ্গত ব্যয়, জামানত হইতে কর্তন করিতে পারিবেন]], তবে স্বাভাবিক ক্ষয়ক্ষতি ইহার অন্তর্ভুক্ত হইবে না, এবং [[stm|প্রত্যেক কর্তনের লিখিত বিবরণ ভাড়াটিয়াকে প্রদান করিবেন]]।'
        }
      ]
    },

    s7: {
      id: 's7', num: '7', numBn: '৭', chapter: 'ch2',
      title_en: 'Limit on advance rent',
      title_bn: 'অগ্রিম ভাড়ার সীমা',
      lineage: 'medium',
      lineageNote: 'Repeal date inferred from the amending Act’s date of assent; no commencement notification was found.',
      repealed: '2018-07-01',
      repealFootnote: 'Section 7 was omitted by section 3 of the Residential Tenancy (Amendment) Act, 2018 (Act No. XII of 2018).',
      versions: [
        {
          vid: 'rtda2006/s7@2006-07-01', label: 'Version 1 (repealed)',
          from: '2006-07-01', to: '2018-06-30',
          short_en: '2 months', short_bn: '২ মাস',
          facts: {},
          amendedBy: null,
          footnote: null,
          dateBasis: 'Original text as enacted. In force from 1 July 2006 under section 1(2) of the Act.',
          en: '[[adv|No landlord shall demand or accept, as advance rent, an amount exceeding two months’ rent]] of the premises.',
          bn: '[[adv|কোনো বাড়িওয়ালা প্রাঙ্গণের দুই মাসের ভাড়ার অধিক পরিমাণ অর্থ অগ্রিম ভাড়া হিসাবে দাবি বা গ্রহণ করিবেন না]]।'
        }
      ]
    },

    s9: {
      id: 's9', num: '9', numBn: '৯', chapter: 'ch2',
      title_en: 'Penalty for withholding deposit',
      title_bn: 'জামানত আটকে রাখার দণ্ড',
      lineage: 'medium',
      lineageNote: 'No commencement notification was found in the Gazette. The date is taken from the amending Act’s date of assent.',
      versions: [
        {
          vid: 'rtda2006/s9@2006-07-01', label: 'Version 1 (as enacted)',
          from: '2006-07-01', to: '2018-06-30',
          short_en: 'Tk 10,000', short_bn: '১০,০০০ টাকা',
          facts: { amt_en: 'ten thousand', amt_bn: 'দশ হাজার', amt: 10000 },
          amendedBy: null,
          footnote: null,
          dateBasis: 'Original text as enacted. In force from 1 July 2006 under section 1(2) of the Act.',
          en: '(1) A landlord who, without lawful excuse, [[pen|fails to return a security deposit as required by section 5 shall be punishable with fine which may extend to ten thousand taka]].\n(2) [[cmp|No court shall take cognizance of an offence under this section except on a written complaint made by the tenant within ninety days]] of the date on which the deposit became returnable.',
          bn: '(১) কোনো বাড়িওয়ালা আইনসঙ্গত কারণ ব্যতীত [[pen|ধারা ৫ অনুযায়ী জামানতের অর্থ ফেরত প্রদানে ব্যর্থ হইলে, তিনি অনধিক দশ হাজার টাকা অর্থদণ্ডে দণ্ডনীয় হইবেন]]।\n(২) [[cmp|জামানত ফেরতযোগ্য হইবার তারিখ হইতে নব্বই দিনের মধ্যে ভাড়াটিয়া কর্তৃক লিখিত অভিযোগ ব্যতীত কোনো আদালত এই ধারার অধীন অপরাধ বিচারার্থ গ্রহণ করিবে না]]।'
        },
        {
          vid: 'rtda2006/s9@2018-07-01', label: 'Version 2 (current)',
          from: '2018-07-01', to: null,
          short_en: 'Tk 25,000', short_bn: '২৫,০০০ টাকা',
          facts: { amt_en: 'twenty-five thousand', amt_bn: 'পঁচিশ হাজার', amt: 25000 },
          changeSummary_en: 'Section 9 was amended with effect from 1 July 2018. The maximum fine is now twenty-five thousand taka, not ten thousand.',
          changeSummary_bn: '১ জুলাই ২০১৮ থেকে ধারা ৯ সংশোধিত হয়েছে। সর্বোচ্চ জরিমানা এখন দশ হাজারের পরিবর্তে পঁচিশ হাজার টাকা।',
          amendedBy: AMEND_2018,
          footnote: 'The words “twenty-five thousand taka” were substituted for the words “ten thousand taka” by section 4 of the Residential Tenancy (Amendment) Act, 2018 (Act No. XII of 2018).',
          dateBasis: 'No commencement notification found. Date taken from the amending Act’s date of assent, 1 July 2018. Medium confidence.',
          en: '(1) A landlord who, without lawful excuse, [[pen|fails to return a security deposit as required by section 5 shall be punishable with fine which may extend to twenty-five thousand taka]].\n(2) [[cmp|No court shall take cognizance of an offence under this section except on a written complaint made by the tenant within ninety days]] of the date on which the deposit became returnable.',
          bn: '(১) কোনো বাড়িওয়ালা আইনসঙ্গত কারণ ব্যতীত [[pen|ধারা ৫ অনুযায়ী জামানতের অর্থ ফেরত প্রদানে ব্যর্থ হইলে, তিনি অনধিক পঁচিশ হাজার টাকা অর্থদণ্ডে দণ্ডনীয় হইবেন]]।\n(২) [[cmp|জামানত ফেরতযোগ্য হইবার তারিখ হইতে নব্বই দিনের মধ্যে ভাড়াটিয়া কর্তৃক লিখিত অভিযোগ ব্যতীত কোনো আদালত এই ধারার অধীন অপরাধ বিচারার্থ গ্রহণ করিবে না]]।'
        }
      ]
    },

    s12: {
      id: 's12', num: '12', numBn: '১২', chapter: 'ch3',
      title_en: 'Forum for tenancy disputes',
      title_bn: 'ভাড়া সংক্রান্ত বিরোধের ফোরাম',
      lineage: 'none',
      lineageNote: 'A footnote records that this section was substituted in 2008, but neither the date that took effect nor the earlier wording could be recovered.',
      versions: [
        {
          vid: 'rtda2006/s12@unknown', label: 'Current text (history not recoverable)',
          from: null, to: null,
          short_en: 'History not verified', short_bn: 'ইতিহাস যাচাই হয়নি',
          facts: {},
          amendedBy: 'Residential Tenancy (Amendment) Ordinance, 2008 (Ordinance No. IV of 2008), section 2',
          footnote: 'Section 12 was substituted by section 2 of the Residential Tenancy (Amendment) Ordinance, 2008 (Ordinance No. IV of 2008).',
          dateBasis: 'Date unknown. No commencement date was found in the Gazette or the Code, and the text before substitution is not available.',
          en: '(1) [[for|Every dispute between a landlord and a tenant arising under this Act shall be heard and determined by the Rent Controller]] having jurisdiction over the area in which the premises are situated.\n(2) [[lim|An application under sub-section (1) shall be made within one year]] from the date on which the cause of action arose.\n(3) [[doc|The application shall be accompanied by a copy of the tenancy agreement, if any, and proof of payment of the security deposit]].',
          bn: '(১) [[for|এই আইনের অধীন বাড়িওয়ালা ও ভাড়াটিয়ার মধ্যে উদ্ভূত প্রত্যেক বিরোধ, যে এলাকায় প্রাঙ্গণ অবস্থিত সেই এলাকার এখতিয়ারসম্পন্ন ভাড়া নিয়ন্ত্রক কর্তৃক শুনানি ও নিষ্পত্তি হইবে]]।\n(২) [[lim|উপ-ধারা (১) এর অধীন আবেদন, নালিশের কারণ উদ্ভূত হইবার তারিখ হইতে এক বৎসরের মধ্যে দাখিল করিতে হইবে]]।\n(৩) [[doc|আবেদনের সহিত ভাড়ার চুক্তিপত্রের অনুলিপি, যদি থাকে, এবং জামানত প্রদানের প্রমাণ সংযুক্ত করিতে হইবে]]।'
        }
      ]
    }
  };

  const CHAPTERS = [
    { id: 'ch2', en: 'Chapter II · Security deposit', bn: 'দ্বিতীয় অধ্যায় · জামানত', sections: ['s5', 's7', 's9'] },
    { id: 'ch3', en: 'Chapter III · Disputes', bn: 'তৃতীয় অধ্যায় · বিরোধ', sections: ['s12'] }
  ];

  /* Research answer templates. f = facts of the version in force on the chosen date. */
  const TOPICS = {
    deposit: {
      retrieve: ['s5', 's9', 's12'],
      sentences: [
        { cites: ['s5:ret'],
          en: (f) => `The landlord must return the security deposit within ${f.s5.days_en} days of the tenant handing back vacant possession of the premises.`,
          bn: (f) => `ভাড়াটিয়া প্রাঙ্গণের খালি দখল বুঝিয়ে দেওয়ার ${f.s5.days_bn} দিনের মধ্যে বাড়িওয়ালাকে জামানতের অর্থ ফেরত দিতে হবে।` },
        { cites: ['s5:ded', 's5:stm'],
          en: () => 'The landlord may deduct rent lawfully due or the reasonable cost of repairing damage beyond ordinary wear and tear, but must give the tenant a written statement of every deduction.',
          bn: () => 'বাড়িওয়ালা আইনত পাওনা ভাড়া বা স্বাভাবিক ক্ষয়ক্ষতির বাইরের ক্ষতি মেরামতের যুক্তিসঙ্গত ব্যয় কেটে রাখতে পারেন, তবে প্রতিটি কর্তনের লিখিত বিবরণ ভাড়াটিয়াকে দিতে হবে।' },
        { cites: ['s9:pen', 's9:cmp'],
          en: (f) => `A landlord who withholds the deposit without lawful excuse can be fined up to ${f.s9.amt_en} taka, on the tenant’s written complaint made within ninety days.`,
          bn: (f) => `যুক্তিসঙ্গত কারণ ছাড়া জামানত আটকে রাখলে বাড়িওয়ালার ${f.s9.amt_bn} টাকা পর্যন্ত অর্থদণ্ড হতে পারে; এজন্য ভাড়াটিয়াকে নব্বই দিনের মধ্যে লিখিত অভিযোগ করতে হবে।` }
      ],
      key_en: (f) => `${f.s5.days} days`,
      key_bn: (f) => `${f.s5.days_bn} দিন`
    },
    penalty: {
      retrieve: ['s9', 's5'],
      sentences: [
        { cites: ['s9:pen'],
          en: (f) => `Failing to return a security deposit without lawful excuse is punishable with a fine of up to ${f.s9.amt_en} taka.`,
          bn: (f) => `আইনসঙ্গত কারণ ছাড়া জামানত ফেরত না দিলে বাড়িওয়ালার সর্বোচ্চ ${f.s9.amt_bn} টাকা অর্থদণ্ড হতে পারে।` },
        { cites: ['s9:cmp'],
          en: () => 'A court can take up the offence only on the tenant’s written complaint, made within ninety days of the date the deposit became returnable.',
          bn: () => 'জামানত ফেরতযোগ্য হওয়ার তারিখ থেকে নব্বই দিনের মধ্যে ভাড়াটিয়ার লিখিত অভিযোগ ছাড়া আদালত এই অপরাধ বিচারার্থ গ্রহণ করবে না।' },
        { cites: ['s5:ret'],
          en: (f) => `The deposit becomes returnable ${f.s5.days_en} days after the tenant hands back vacant possession.`,
          bn: (f) => `ভাড়াটিয়া খালি দখল বুঝিয়ে দেওয়ার ${f.s5.days_bn} দিন পর জামানত ফেরতযোগ্য হয়।` }
      ],
      key_en: (f) => `Fine up to Tk ${f.s9.amt.toLocaleString('en-IN')}`,
      key_bn: (f) => `সর্বোচ্চ ${f.s9.amt_bn} টাকা`
    },
    forum: {
      retrieve: ['s12', 's5'],
      sentences: [
        { cites: ['s12:for'],
          en: () => 'A dispute between a landlord and a tenant under this Act is heard and decided by the Rent Controller for the area where the premises are located.',
          bn: () => 'এই আইনের অধীন বাড়িওয়ালা ও ভাড়াটিয়ার বিরোধ প্রাঙ্গণ যে এলাকায় অবস্থিত, সেই এলাকার ভাড়া নিয়ন্ত্রক শুনানি করে নিষ্পত্তি করবেন।' },
        { cites: ['s12:lim'],
          en: () => 'The application must be made within one year of the date the cause of action arose.',
          bn: () => 'নালিশের কারণ উদ্ভূত হওয়ার তারিখ থেকে এক বছরের মধ্যে আবেদন দাখিল করতে হবে।' },
        { cites: ['s12:doc'],
          en: () => 'It must be accompanied by a copy of the tenancy agreement, if there is one, and proof that the security deposit was paid.',
          bn: () => 'আবেদনের সঙ্গে ভাড়ার চুক্তিপত্রের অনুলিপি (যদি থাকে) এবং জামানত প্রদানের প্রমাণ দিতে হবে।' }
      ],
      key_en: () => 'Rent Controller, within 1 year',
      key_bn: () => 'ভাড়া নিয়ন্ত্রক, ১ বছরের মধ্যে'
    }
  };

  /* Keyword routing for the demo engine (stands in for hybrid retrieval). */
  const KEYWORDS = {
    // English words ending in * match as prefixes ("fine*" matches "fined").
    predict: ['জিত', 'হারব', 'হারবে', 'কার পক্ষে', 'রায় দেবেন', 'রায় দিবেন', 'রায় কী হবে', 'সম্ভাবনা', 'win', 'wins', 'lose', 'will the judge', 'judge decide', 'predict*', 'chance*', 'likely to'],
    penalty: ['শাস্তি', 'জরিমানা', 'দণ্ড', 'penalt*', 'fine*', 'punish*'],
    forum: ['কোথায়', 'ফোরাম', 'বিরোধ', 'ভাড়া নিয়ন্ত্রক', 'নালিশ', 'forum', 'where', 'court*', 'rent controller', 'dispute*', 'apply'],
    deposit: ['জামানত', 'ফেরত', 'কর্তন', 'কেটে', 'deposit*', 'return*', 'deduct*']
  };

  const EXAMPLES = [
    { q: 'জামানত ফেরত দেওয়ার সময়সীমা কত দিন?', date: 'today', kind: 'normal', label: 'Deposit deadline, today' },
    { q: 'জামানত ফেরত দেওয়ার সময়সীমা কত দিন?', date: '2023-08-14', kind: 'historical', label: 'Same question, 14 Aug 2023' },
    { q: 'জামানত আটকে রাখলে বাড়িওয়ালার কী শাস্তি হয়?', date: '2017-05-20', kind: 'historical', label: 'Penalty, as of 2017' },
    { q: 'How much can a landlord be fined for withholding a deposit?', date: 'today', lang: 'en', kind: 'normal', label: 'Penalty, in English' },
    { q: 'ভাড়া নিয়ে বিরোধ হলে কোথায় আবেদন করতে হবে?', date: 'today', kind: 'lowconf', label: 'Where to file a dispute' },
    { q: 'ভাড়াটিয়ার বিদ্যুৎ বিলের ওপর ভ্যাটের হার কত?', date: 'today', kind: 'refusal', label: 'VAT on electricity bills' },
    { q: 'আমার মামলায় বিচারক কার পক্ষে রায় দেবেন?', date: 'today', kind: 'predict', label: 'Who will the judge favour?' }
  ];

  const MATTERS = [
    {
      id: 'm1',
      title: 'Tahmina Rahman v. Shapla Properties Ltd.',
      caseNo: 'RC 214/2026', court: 'Rent Controller, Dhaka Zone 3',
      stage: 'Evidence', client: 'Tahmina Rahman (tenant, applicant)',
      opponent: 'Shapla Properties Ltd. (landlord, respondent)',
      hearing: { date: rel(0), time: '10:30', purpose: 'Evidence of applicant' },
      causeDate: '2023-08-14',
      summary: 'Tenant vacated a flat in August 2023. The landlord kept Tk 38,000 of a Tk 60,000 deposit for repainting and gave no written statement of deductions.',
      provisions: [
        { sid: 's5', note: 'Version 1 governs: the cause of action (14 Aug 2023) predates the 2024 amendment. Seven days, not five.' },
        { sid: 's9', note: 'Version 2 in force on 14 Aug 2023. Maximum fine Tk 25,000.' },
        { sid: 's12', note: 'Forum and one-year limitation. Amendment history unverified.' }
      ],
      documents: [
        { name: 'Tenancy agreement, 1 Feb 2021.pdf', kind: 'Agreement', pages: 6 },
        { name: 'Deposit receipt, Tk 60,000.jpg', kind: 'Evidence', pages: 1 },
        { name: 'Landlord’s legal notice, 2 Sep 2023.pdf', kind: 'Correspondence', pages: 3 },
        { name: 'Application to Rent Controller, 20 May 2024.pdf', kind: 'Pleading', pages: 11 }
      ],
      chronology: [
        { date: '2021-02-01', text: 'Tenancy begins. Security deposit of Tk 60,000 paid.' },
        { date: '2023-08-07', text: 'Tenant hands back vacant possession and keys.' },
        { date: '2023-08-14', text: 'Deposit becomes returnable: seven-day period under section 5 (version in force on this date).', legal: true },
        { date: '2023-09-02', text: 'Landlord’s notice: Tk 38,000 deducted for repainting. No written statement of deductions.' },
        { date: '2024-01-01', text: 'Amendment to section 5 takes effect (seven days becomes five). Does not apply to this matter.', legal: true },
        { date: '2024-05-20', text: 'Application filed before the Rent Controller, within one year under section 12(2).', legal: true },
        { date: rel(0), text: 'Hearing: evidence of applicant.' }
      ],
      research: [
        { q: 'জামানত ফেরত দেওয়ার সময়সীমা কত দিন?', date: '2023-08-14', lang: 'bn', outcome: 'historical', answer: '7 days' },
        { q: 'জামানত আটকে রাখলে বাড়িওয়ালার কী শাস্তি হয়?', date: '2023-08-14', lang: 'bn', outcome: 'normal', answer: 'Fine up to Tk 25,000' },
        { q: 'ভাড়া নিয়ে বিরোধ হলে কোথায় আবেদন করতে হবে?', date: '2024-05-20', lang: 'bn', outcome: 'lowconf', answer: 'Rent Controller, within 1 year' }
      ],
      drafts: [
        { title: 'Reply to landlord’s legal notice', tpl: 'notice', updated: rel(-3), cites: 3, flagged: 1 },
        { title: 'Written submissions on section 5(2)', tpl: 'opinion', updated: rel(-1), cites: 4, flagged: 0 }
      ]
    },
    {
      id: 'm2',
      title: 'Karim Traders v. Meghna Tower Owners’ Association',
      caseNo: 'Civil Suit 88/2026', court: 'Joint District Judge, 2nd Court, Dhaka',
      stage: 'Written statement', client: 'Meghna Tower Owners’ Association (defendant)',
      opponent: 'Karim Traders (plaintiff)',
      hearing: { date: rel(7), time: '11:00', purpose: 'Filing of written statement' },
      causeDate: '2025-11-03',
      summary: 'Commercial tenant claims refund of advance rent of six months. Plaint relies on section 7, which was repealed in 2018.',
      provisions: [
        { sid: 's7', note: 'Repealed with effect from 1 July 2018. Not available to the plaintiff.' },
        { sid: 's12', note: 'Possible objection to forum: tenancy disputes go to the Rent Controller.' }
      ],
      documents: [
        { name: 'Plaint, Karim Traders.pdf', kind: 'Pleading', pages: 14 },
        { name: 'Lease deed, 2022.pdf', kind: 'Agreement', pages: 9 }
      ],
      chronology: [
        { date: '2018-07-01', text: 'Section 7 (limit on advance rent) repealed.', legal: true },
        { date: '2022-03-15', text: 'Lease of ground-floor shop begins. Six months’ advance rent paid.' },
        { date: '2025-11-03', text: 'Lease terminated by plaintiff.' },
        { date: '2026-02-10', text: 'Suit filed.' }
      ],
      research: [
        { q: 'অগ্রিম ভাড়ার সর্বোচ্চ সীমা কত?', date: '2022-03-15', lang: 'bn', outcome: 'refusal', answer: 'No answer: section 7 not in force' }
      ],
      drafts: [
        { title: 'Written statement (draft 2)', tpl: 'ws', updated: rel(-2), cites: 3, flagged: 1 }
      ]
    },
    {
      id: 'm3',
      title: 'State v. Abdul Halim',
      caseNo: 'CR 1407/2026', court: 'Metropolitan Magistrate, Court 6, Dhaka',
      stage: 'Cognizance', client: 'Nasima Akter (complainant tenant)',
      opponent: 'Abdul Halim (landlord, accused)',
      hearing: { date: rel(0), time: '14:30', purpose: 'Hearing on cognizance' },
      causeDate: rel(-40),
      summary: 'Complaint under section 9 for withholding a Tk 45,000 deposit. Question whether the complaint was made within ninety days.',
      provisions: [
        { sid: 's9', note: 'Current version: fine up to Tk 25,000. Date of amendment is medium confidence.' },
        { sid: 's5', note: 'Current version: five days.' }
      ],
      documents: [ { name: 'Complaint petition.pdf', kind: 'Pleading', pages: 5 } ],
      chronology: [
        { date: rel(-45), text: 'Tenant hands back possession.' },
        { date: rel(-40), text: 'Deposit becomes returnable (five days, section 5).', legal: true },
        { date: rel(-12), text: 'Written complaint filed.' }
      ],
      research: [
        { q: 'জামানত আটকে রাখলে বাড়িওয়ালার কী শাস্তি হয়?', date: rel(-40), lang: 'bn', outcome: 'normal', answer: 'Fine up to Tk 25,000' }
      ],
      drafts: []
    },
    {
      id: 'm4',
      title: 'Rupa Begum v. Alam Estates',
      caseNo: 'Not yet filed', court: 'Rent Controller, Dhaka Zone 1',
      stage: 'Intake', client: 'Rupa Begum (tenant)',
      opponent: 'Alam Estates (landlord)',
      hearing: null,
      causeDate: rel(9, -1),
      summary: 'Deposit of Tk 30,000 not returned. Limitation under section 12(2) expires soon.',
      provisions: [ { sid: 's12', note: 'One year from the cause of action. Amendment history unverified.' } ],
      documents: [ { name: 'Deposit receipt.jpg', kind: 'Evidence', pages: 1 } ],
      chronology: [
        { date: rel(2, -1), text: 'Tenant hands back possession.' },
        { date: rel(9, -1), text: 'Cause of action: deposit not returned.', legal: true }
      ],
      research: [],
      drafts: []
    }
  ];

  const DEADLINES = [
    { matter: 'm2', label: 'Written statement due', date: rel(2) },
    { matter: 'm3', label: 'Reply to show-cause notice', date: rel(5) },
    { matter: 'm4', label: 'Limitation expires, section 12(2)', date: rel(9) },
    { matter: 'm1', label: 'File list of documents', date: rel(16) }
  ];

  const EXTRA_EVENTS = [
    { date: rel(13), kind: 'hearing', label: 'Rahman v. Shapla: cross-examination', matter: 'm1' },
    { date: rel(21), kind: 'hearing', label: 'State v. Halim: charge hearing', matter: 'm3' },
    { date: rel(-6), kind: 'hearing', label: 'Rahman v. Shapla: adjourned', matter: 'm1' }
  ];

  const RECENT_RESEARCH = [
    { q: 'জামানত ফেরত দেওয়ার সময়সীমা কত দিন?', date: '2023-08-14', outcome: 'historical', answer: '7 days', when: 'Yesterday' },
    { q: 'জামানত ফেরত দেওয়ার সময়সীমা কত দিন?', date: 'today', outcome: 'normal', answer: '5 days', when: 'Yesterday' },
    { q: 'ভাড়া নিয়ে বিরোধ হলে কোথায় আবেদন করতে হবে?', date: 'today', outcome: 'lowconf', answer: 'Rent Controller, within 1 year', when: '2 days ago' }
  ];

  const JUDGMENTS = [
    {
      id: 'j4', name: 'Nurjahan Properties Ltd. v. Kamal Hossain', court: 'Appellate Division', year: 2021,
      cite: '9 DmLR (AD) 112', sections: ['s5(2)', 's9(1)'], treatment: 'Followed', score: 0.94,
      facts: 'Landlord deducted repainting costs from the deposit without any written statement.',
      held: 'A written statement of deductions is mandatory. Without it, the whole deposit is returnable.',
      passageIndex: 2,
      paragraphs: [
        'This appeal arises from an application by a tenant for return of a security deposit of Tk 50,000, of which the landlord retained Tk 32,000 on account of repainting.',
        'The High Court Division, following Bright Homes Ltd. v. Farid Uddin, held that a written statement was not necessary where the tenant knew the nature of the deductions.',
        'We are unable to agree. Section 5(2) permits a deduction only where the landlord gives the tenant a written statement of every deduction. The requirement is not a formality; it is the condition on which the power to deduct is granted. Where no written statement is given, no deduction is lawful and the whole deposit is returnable.',
        'Bright Homes Ltd. v. Farid Uddin is overruled to the extent it holds otherwise.',
        'The appeal is allowed. The landlord shall return the full deposit within thirty days.'
      ],
      cites: [ { id: 'j2', rel: 'Overrules' }, { id: 'j1', rel: 'Follows' } ],
      citedBy: [ { name: 'Ayesha Siddiqua v. Rahim Builders (2023)', rel: 'Followed by' } ]
    },
    {
      id: 'j1', name: 'Selina Parvin v. Golden Nest Housing Ltd.', court: 'High Court Division', year: 2017,
      cite: '5 DmLR (HCD) 341', sections: ['s5(1)'], treatment: 'Followed', score: 0.81,
      facts: 'Dispute over when vacant possession is delivered when keys are left with a caretaker.',
      held: 'Vacant possession is delivered when the keys reach the landlord or the landlord’s agent.',
      passageIndex: 1,
      paragraphs: [
        'The tenant vacated the premises and handed the keys to the building caretaker employed by the landlord.',
        'Time under section 5(1) runs from the delivery of vacant possession. Delivery to the landlord’s authorised agent is delivery to the landlord.',
        'The rule is applied.'
      ],
      cites: [], citedBy: [ { name: 'Nurjahan Properties Ltd. v. Kamal Hossain (2021)', rel: 'Followed by' } ]
    },
    {
      id: 'j3', name: 'Mizanur Rahman v. Rent Controller, Zone 2', court: 'High Court Division', year: 2019,
      cite: '7 DmLR (HCD) 58', sections: ['s12(1)'], treatment: 'Distinguished', score: 0.62,
      facts: 'Whether the Rent Controller can hear a dispute over premises used partly for business.',
      held: 'Jurisdiction depends on the premises being let for residence; mixed-use lettings decided on facts.',
      passageIndex: 1,
      paragraphs: [
        'The petitioner let a ground-floor unit used both as a residence and a shop.',
        'Section 12(1) confers jurisdiction over disputes arising under this Act, which governs residential tenancies. Where the dominant purpose of the letting is business, the Rent Controller has no jurisdiction.',
        'Distinguished in later cases where the residential use was dominant.'
      ],
      cites: [], citedBy: []
    },
    {
      id: 'j2', name: 'Bright Homes Ltd. v. Farid Uddin', court: 'High Court Division', year: 2013,
      cite: '1 DmLR (HCD) 207', sections: ['s5(2)'], treatment: 'Overruled', score: 0.77,
      facts: 'Deductions for damage made without a written statement, the tenant being aware of them.',
      held: 'Written statement not required where tenant knew of the deductions. Overruled in 2021.',
      passageIndex: 1,
      paragraphs: [
        'The tenant was present when the damage was inspected and agreed to the estimate.',
        'In these circumstances the absence of a written statement does not invalidate the deduction.',
        'The application is dismissed.'
      ],
      cites: [], citedBy: [ { name: 'Nurjahan Properties Ltd. v. Kamal Hossain (2021)', rel: 'Overruled by' } ]
    }
  ];

  /* Drafting templates. Plain text; citations are detected and checked live. */
  const TEMPLATES = {
    notice: {
      name: 'Legal notice', bn: 'আইনি নোটিশ',
      paras: [
        'To: The Managing Director, Shapla Properties Ltd., House 14, Road 7, Dhaka.',
        'Under instruction from my client, Tahmina Rahman, I give you notice as follows.',
        'My client delivered vacant possession of the flat on 7 August 2023. Under section 5(1) of the Residential Tenancy (Deposit and Notice) Act, 2006, the security deposit of Tk 60,000 became returnable within seven days.',
        'You retained Tk 38,000 without giving the written statement of deductions required by section 5(2).',
        'You further demanded advance rent in breach of section 7 of the said Act.',
        'Unless the full deposit is returned within fifteen days, my client will apply to the Rent Controller under section 12 and file a complaint under section 9.'
      ]
    },
    plaint: {
      name: 'Plaint', bn: 'আরজি',
      paras: [
        'বিজ্ঞ ভাড়া নিয়ন্ত্রক, ঢাকা অঞ্চল ৩ সমীপে।',
        'বাদী: তাহমিনা রহমান। বিবাদী: শাপলা প্রপার্টিজ লিমিটেড।',
        'বাদী ৭ আগস্ট ২০২৩ তারিখে ফ্ল্যাটের খালি দখল হস্তান্তর করেন। আবাসিক ভাড়া (জামানত ও নোটিশ) আইন, ২০০৬ এর ধারা ৫(১) অনুযায়ী বিবাদী সাত দিনের মধ্যে জামানত ফেরত দিতে বাধ্য ছিলেন।',
        'বিবাদী ধারা ৫(২) অনুযায়ী লিখিত বিবরণ ছাড়াই ৩৮,০০০ টাকা কর্তন করেছেন।',
        'এই আবেদন ধারা ১২ এর অধীন নির্ধারিত সময়ের মধ্যে দাখিল করা হলো।'
      ]
    },
    ws: {
      name: 'Written statement', bn: 'লিখিত জবাব',
      paras: [
        'In the Court of the Joint District Judge, 2nd Court, Dhaka. Civil Suit 88 of 2026.',
        'Written statement on behalf of the defendant, Meghna Tower Owners’ Association.',
        'The plaintiff’s claim rests on section 7 of the Residential Tenancy (Deposit and Notice) Act, 2006. The defendant states that no such limit applied when the lease was made in 2022.',
        'The suit is not maintainable in this Court, as disputes under the Act lie before the Rent Controller under section 12.',
        'The defendant denies any liability under section 9.'
      ]
    },
    opinion: {
      name: 'Opinion', bn: 'আইনি মতামত',
      paras: [
        'Opinion on deductions from the security deposit: Rahman v. Shapla Properties.',
        'The relevant date is 14 August 2023. Section 5(1) as it then stood required return within seven days; the five-day period applies only from 1 January 2024.',
        'Section 5(2) makes a written statement of deductions a condition of any deduction, as held in Nurjahan Properties Ltd. v. Kamal Hossain.',
        'A complaint under section 9 is also available, subject to the ninety-day limit.',
        'The application was filed within one year, as required by section 12(2).'
      ]
    }
  };

  const CAUSE_LIST = [
    { no: 1, caseNo: 'RC 214/2026', parties: 'Tahmina Rahman v. Shapla Properties Ltd.', stage: 'Evidence', flag: 'Section 5 amended after cause of action', flagKind: 'blue', matter: 'm1' },
    { no: 2, caseNo: 'RC 198/2026', parties: 'Jasim Uddin v. Green View Apartments', stage: 'Order', flag: 'Respondent cites an overruled judgment', flagKind: 'red' },
    { no: 3, caseNo: 'RC 233/2026', parties: 'Shirin Akhter v. Hossain Brothers', stage: 'Hearing', flag: '', flagKind: '' },
    { no: 4, caseNo: 'RC 240/2026', parties: 'Monir Hossain v. Delta Homes Ltd.', stage: 'Adjournment petition', flag: 'Third adjournment requested', flagKind: 'amber' },
    { no: 5, caseNo: 'RC 251/2026', parties: 'Farzana Islam v. Lake Side Housing', stage: 'Mediation report', flag: 'ADR eligible', flagKind: 'green' },
    { no: 6, caseNo: 'RC 262/2026', parties: 'Rashed Khan v. Noor Developers', stage: 'Fresh application', flag: '', flagKind: '' }
  ];

  const GRIEVANCES = [
    { id: 'G-1043', text: 'বাড়ি ছেড়ে দিয়েছি দুই মাস আগে, বাড়িওয়ালা জামানতের ৪০,০০০ টাকা ফেরত দিচ্ছেন না।', received: rel(-1),
      law: 'Sections 5 and 9', forum: 'Rent Controller (section 12)', limitation: 'About 10 months left', limitKind: 'green', adr: true },
    { id: 'G-1044', text: 'জামানত থেকে রং করার খরচ কেটে রেখেছে, কোনো হিসাব দেয়নি।', received: rel(-1),
      law: 'Section 5(2); Nurjahan Properties (2021)', forum: 'Rent Controller (section 12)', limitation: 'About 7 months left', limitKind: 'green', adr: true },
    { id: 'G-1045', text: 'বাড়িওয়ালা ছয় মাসের অগ্রিম ভাড়া চাইছেন।', received: rel(-2),
      law: 'Section 7 repealed in 2018. No current provision found', forum: 'Refer to legal aid officer', limitation: 'Not applicable', limitKind: 'red', adr: false },
    { id: 'G-1046', text: 'জামানত ফেরত চেয়ে আবেদন করতে চাই, ঘটনা প্রায় এক বছর আগের।', received: rel(-3),
      law: 'Sections 5 and 12', forum: 'Rent Controller (section 12)', limitation: '12 days left', limitKind: 'amber', adr: false }
  ];

  const ANALYTICS = {
    court: 'District court complex, demo district',
    pendency: [
      { label: 'Civil suits', value: 3880 },
      { label: 'Criminal complaints', value: 2910 },
      { label: 'Family', value: 1560 },
      { label: 'Rent disputes', value: 1240 },
      { label: 'Execution', value: 870 }
    ],
    age: [
      { label: 'Under 1 year', value: 34 },
      { label: '1 to 3 years', value: 29 },
      { label: '3 to 5 years', value: 21 },
      { label: 'Over 5 years', value: 16 }
    ],
    adr: { flagged: 1310, of: 10460, top: ['Rent disputes: 612', 'Family: 401', 'Civil suits: 297'] },
    trend: [
      { q: 'Q3 2025', filed: 1120, disposed: 960 },
      { q: 'Q4 2025', filed: 1180, disposed: 1010 },
      { q: 'Q1 2026', filed: 1090, disposed: 1060 },
      { q: 'Q2 2026', filed: 1150, disposed: 1130 },
      { q: 'Q3 2026', filed: 1100, disposed: 1170 }
    ]
  };

  window.DHARA = {
    act: ACT, sections: SECTIONS, chapters: CHAPTERS, topics: TOPICS, keywords: KEYWORDS,
    examples: EXAMPLES, matters: MATTERS, deadlines: DEADLINES, extraEvents: EXTRA_EVENTS,
    recentResearch: RECENT_RESEARCH, judgments: JUDGMENTS, templates: TEMPLATES,
    causeList: CAUSE_LIST, grievances: GRIEVANCES, analytics: ANALYTICS,
    sourceBase: 'https://code.example.org/rtda-2006/'
  };
})();
