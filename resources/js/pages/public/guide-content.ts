export type Block =
    | { type: 'p'; text: string }
    | { type: 'steps'; items: string[] }
    | { type: 'bullets'; items: string[] }
    | { type: 'note'; text: string }
    | { type: 'table'; columns: [string, string]; rows: [string, string][] };

export type GuideSection = {
    heading: string;
    blocks: Block[];
};

export type GuideArticle = {
    id: string;
    title: string;
    summary: string;
    audience: string;
    menu: string;
    keywords: string[];
    sections: GuideSection[];
    related: string[];
};

export type GuideGroup = {
    id: string;
    label: string;
    description: string;
    articles: string[];
};

export const guideGroups: GuideGroup[] = [
    {
        id: 'start',
        label: 'Getting started',
        description: 'Sign in, learn the screen, and see how every list works.',
        articles: ['overview', 'sign-in', 'lists', 'dashboard'],
    },
    {
        id: 'sales',
        label: 'Sales & customers',
        description: 'From the first inquiry to a reserved unit.',
        articles: ['leads', 'pipeline', 'test-drives', 'reservations', 'customers'],
    },
    {
        id: 'inventory',
        label: 'Inventory',
        description: 'Models, physical units, and parts on the shelf.',
        articles: ['vehicle-models', 'vehicles', 'parts'],
    },
    {
        id: 'service',
        label: 'Service',
        description: 'Work orders, the service menu, and warranty.',
        articles: ['work-orders', 'service-types', 'common-services', 'warranty', 'aftersales'],
    },
    {
        id: 'compliance',
        label: 'Compliance',
        description: 'Checklists, reminders, and supervisor review.',
        articles: ['checklists', 'reminders', 'approvals'],
    },
    {
        id: 'reports',
        label: 'Reports & history',
        description: 'Results, who changed what, and sign-in history.',
        articles: ['metrics', 'activity-logs', 'time-tracking'],
    },
    {
        id: 'admin',
        label: 'Administration',
        description: 'People, branches, and what each role can do.',
        articles: ['users', 'branches', 'roles'],
    },
];

export const guideArticles: GuideArticle[] = [
    {
        id: 'overview',
        title: 'How to use this guide',
        summary: 'Find the article for the screen you are on, then follow the steps while the system is open beside it.',
        audience: 'Everyone',
        menu: 'This page, /guide',
        keywords: ['help', 'guide', 'search', 'share', 'training'],
        sections: [
            {
                heading: 'Find an answer',
                blocks: [
                    { type: 'p', text: 'Use the search box for a word you see on screen, such as reservation, odometer, OR/CR, or warranty. Or open a module on the left and pick the article that matches the menu name.' },
                    { type: 'steps', items: [
                        'Search, or choose a module in the left panel.',
                        'Read **Where to go** so you open the same menu in Wuling.',
                        'Follow the numbered steps. Field names in bold match the labels on the form.',
                        'Check the status table before you change a record, so you pick the status the rest of the team expects.',
                    ] },
                ],
            },
            {
                heading: 'Share one topic',
                blocks: [
                    { type: 'p', text: 'Each article has its own address. Open the article, then use **Copy link** and send that address in chat. The person does not need to be signed in to read it.' },
                    { type: 'note', text: 'The menus you see after sign-in depend on your role. If a step tells you to open a menu you do not have, ask an administrator. The article is still the right procedure once access is granted.' },
                ],
            },
        ],
        related: ['sign-in', 'lists', 'dashboard'],
    },
    {
        id: 'sign-in',
        title: 'Sign in and your account',
        summary: 'Use the account you were given. The system records work against that name.',
        audience: 'Everyone',
        menu: 'Sign-in page',
        keywords: ['login', 'password', 'logout', 'forgot password', 'session', 'branch'],
        sections: [
            {
                heading: 'Sign in',
                blocks: [
                    { type: 'steps', items: [
                        'Open the system address your administrator sent you.',
                        'Enter your **email** and **password**.',
                        'Tick **Remember me** only on a computer you alone use.',
                        'Choose **Log in**. You land on the dashboard.',
                    ] },
                ],
            },
            {
                heading: 'If you cannot get in',
                blocks: [
                    { type: 'bullets', items: [
                        'Choose **Forgot password** and follow the email. Check spam if it does not arrive within a few minutes.',
                        'If the email never comes, ask an administrator to confirm the address on your user record.',
                        'If the system signs you out while you are away, sign in again. Unused sessions are closed on purpose.',
                    ] },
                    { type: 'note', text: 'Do not share your password or a verification code. Deletes of roles and permissions ask for a code sent to the administrator’s email. That code is only for the person who received it.' },
                ],
            },
            {
                heading: 'What you are allowed to see',
                blocks: [
                    { type: 'p', text: 'Your **role** decides the menus. Your **branch** decides the records. A sales rep in Cebu sees Cebu leads and units. An administrator or auditor can see every branch.' },
                    { type: 'p', text: 'When you finish, open your name at the bottom of the left menu and choose **Log out**.' },
                ],
            },
        ],
        related: ['users', 'roles', 'dashboard'],
    },
    {
        id: 'lists',
        title: 'Search, filters, download, and restore',
        summary: 'Most screens are a list. Learn this once and the rest of the modules feel the same.',
        audience: 'Everyone',
        menu: 'Any list, such as Lead Management or Vehicle Inventory',
        keywords: ['filter', 'search', 'export', 'csv', 'download', 'delete', 'restore', 'branch'],
        sections: [
            {
                heading: 'Narrow a list',
                blocks: [
                    { type: 'steps', items: [
                        'Type a name, phone, plate, VIN, or reference in the search box, then apply the search.',
                        'Set one filter at a time. Status, branch, and date are the usual ones.',
                        'Clear the filters when the list looks empty and you expected rows. An old filter is the most common reason.',
                    ] },
                    { type: 'note', text: 'If you are not an administrator or auditor, the branch filter only offers your branch. You will not see another branch’s customers by searching harder.' },
                ],
            },
            {
                heading: 'Download what is on screen',
                blocks: [
                    { type: 'p', text: 'Where a download or export button is shown, it saves the rows that match your current search and filters, as a spreadsheet. Leads, warranty claims, parts, work orders, and activity logs can be downloaded this way.' },
                    { type: 'p', text: 'The file is capped. If you need everything, split the download with filters, for example one status or one month at a time.' },
                ],
            },
            {
                heading: 'Delete and restore',
                blocks: [
                    { type: 'p', text: 'Delete hides a record from the working list. It stays in the system so it can be restored. On the list, show deleted rows if that option is there, then choose **Restore**.' },
                    { type: 'p', text: 'You only see Delete or Restore when your role includes that permission.' },
                ],
            },
        ],
        related: ['overview', 'activity-logs', 'leads'],
    },
    {
        id: 'dashboard',
        title: 'Dashboard and calendar',
        summary: 'The home screen shows what needs attention today. The calendar shows the next couple of weeks.',
        audience: 'Everyone',
        menu: 'Dashboard, and Dashboard calendar',
        keywords: ['dashboard', 'calendar', 'checklist', 'home'],
        sections: [
            {
                heading: 'Read the home screen',
                blocks: [
                    { type: 'p', text: 'Cards summarize sales, vehicles, service work, and checklist items assigned to you. The numbers follow your branch, unless you are an administrator or auditor and have chosen another branch in the filter.' },
                    { type: 'bullets', items: [
                        'Open a card or its link when you need the underlying list.',
                        'Tick a checklist item on the dashboard when you finish that step. Progress updates for the rest of the team.',
                        'Use **Checklist & Reminders** in the left menu when you want the full assignment, not only the items shown on the home screen.',
                    ] },
                ],
            },
            {
                heading: 'Use the calendar',
                blocks: [
                    { type: 'steps', items: [
                        'From the dashboard, open **Calendar**.',
                        'Look across the next two weeks for test drives and scheduled service.',
                        'Open an entry to go to that test drive or work order.',
                    ] },
                    { type: 'note', text: 'The calendar is a view. Create the test drive or the work order in its own module. The calendar then picks it up.' },
                ],
            },
        ],
        related: ['checklists', 'test-drives', 'work-orders'],
    },
    {
        id: 'leads',
        title: 'Lead management',
        summary: 'Record everyone who has shown interest, then follow up before they go cold.',
        audience: 'Sales rep, sales manager, administrator',
        menu: 'Sales & Customer → Lead Management',
        keywords: ['lead', 'follow-up', 'import', 'hot', 'phone', 'source', 'score'],
        sections: [
            {
                heading: 'Create a lead',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Lead Management** and choose **Create**.',
                        'Enter the name and **phone**. You may type 09… or +63…. The system stores +63.',
                        'Add email if you have it, the **source** (walk-in, phone, web form, referral, or social media), and the vehicle they asked about.',
                        'Set a follow-up date and write what you promised to do next.',
                        'Save. The lead gets an ID you can search later, such as LD-2026-001.',
                    ] },
                    { type: 'note', text: 'Search by name or phone before you create a lead. A second record for the same person splits the follow-ups.' },
                ],
            },
            {
                heading: 'Work the list',
                blocks: [
                    { type: 'p', text: 'The top of the page shows total leads, hot leads, conversion, and leads flagged as suspicious. **Upcoming Follow-ups (Next 7 Days)** is the list to clear each morning.' },
                    { type: 'table', columns: ['Status', 'When to use it'], rows: [
                        ['New', 'Just captured. Nobody has worked it yet.'],
                        ['Contacted', 'You have reached them at least once.'],
                        ['Hot', 'They are actively interested. Treat this as today’s work.'],
                        ['Qualified', 'Budget, model, and timing are real. Ready for the pipeline.'],
                        ['Unqualified', 'Not a buyer right now. Keep the reason in the notes.'],
                        ['Lost', 'They bought elsewhere or asked you to stop.'],
                    ] },
                    { type: 'p', text: 'Score filters group leads as high (80+), medium (60–79), or low (under 60). A qualified lead with a high score can be picked up by the sales pipeline.' },
                ],
            },
            {
                heading: 'Bring in a batch',
                blocks: [
                    { type: 'steps', items: [
                        'On the lead list, open **Bulk Import Leads**.',
                        'Download the template and fill it. Do not rename the columns.',
                        'Upload the file and check the result. Fix any row the system rejects, then import those rows again.',
                    ] },
                ],
            },
            {
                heading: 'Move a lead to another branch',
                blocks: [
                    { type: 'p', text: 'On the lead, branch is read-only for most people. An administrator, or someone with permission to reassign a branch, can change it. The change is written to the activity log.' },
                ],
            },
        ],
        related: ['pipeline', 'customers', 'lists'],
    },
    {
        id: 'pipeline',
        title: 'Sales pipeline',
        summary: 'Track a real deal from qualified interest through quote, test drive, reservation, and a win or a loss.',
        audience: 'Sales rep, sales manager, administrator',
        menu: 'Sales & Customer → Sales Pipeline',
        keywords: ['pipeline', 'quote', 'stage', 'won', 'lost', 'probability', 'kanban'],
        sections: [
            {
                heading: 'What belongs here',
                blocks: [
                    { type: 'p', text: 'A pipeline record is a deal, not a casual inquiry. Start one when the customer is qualified, or let a strong lead create one. Keep the phone number on the deal so test drives and reservations can find it.' },
                    { type: 'table', columns: ['Stage', 'Meaning'], rows: [
                        ['Lead', 'Opened, still early.'],
                        ['Qualified', 'They can buy, and you know which model.'],
                        ['Quote Sent', 'A price has been given. Record the quote amount.'],
                        ['Test Drive Scheduled', 'A drive is booked.'],
                        ['Test Drive Completed', 'They have driven the vehicle.'],
                        ['Reservation Made', 'Money is down and a unit is held.'],
                        ['Won', 'The unit is sold.'],
                        ['Lost', 'The deal stopped.'],
                    ] },
                ],
            },
            {
                heading: 'Update a deal',
                blocks: [
                    { type: 'steps', items: [
                        'Open the deal from **Sales Pipeline**.',
                        'Move the stage only when the event has happened. Skipping ahead makes the reports lie.',
                        'Enter the **quote amount** when you send a price.',
                        'Set the next action and a due date before you leave the page.',
                        'Save.',
                    ] },
                    { type: 'note', text: 'A deal with no activity for about a week can be marked lost automatically. If the customer is still in play, log a note or a next step so the deal stays open.' },
                ],
            },
            {
                heading: 'How other modules move the deal',
                blocks: [
                    { type: 'bullets', items: [
                        'Scheduling a test drive for the same phone or email can move the deal to **Test Drive Scheduled**.',
                        'Confirming that test drive can move it further when the stage allows it.',
                        'A reservation tied to the same customer should match the deal you already have. Do not start a second deal for the same buyer.',
                    ] },
                ],
            },
        ],
        related: ['leads', 'test-drives', 'reservations', 'vehicles'],
    },
    {
        id: 'test-drives',
        title: 'Test drives',
        summary: 'Book the drive, check the customer, collect a signature, and mark what actually happened.',
        audience: 'Sales rep, sales manager, administrator',
        menu: 'Sales & Customer → Test Drives',
        keywords: ['test drive', 'calendar', 'signature', 'license', 'insurance', 'no show'],
        sections: [
            {
                heading: 'Book a drive',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Test Drives** and choose **Create**.',
                        'Enter the customer name and phone. Use the same phone as the lead or pipeline deal.',
                        'Choose the vehicle, the date, the time, and how long you need it. Duration is between 15 and 120 minutes.',
                        'Mark the type as **Scheduled** or **Walk-in**.',
                        'Save. The drive appears on the test-drive calendar and on the dashboard calendar.',
                    ] },
                ],
            },
            {
                heading: 'Before the customer drives',
                blocks: [
                    { type: 'bullets', items: [
                        'Confirm the **license**. The screen shows whether it is verified.',
                        'Confirm the customer’s **insurance**. This check is about the customer, and it shows red or green.',
                        'Walk through the acknowledgement checklist.',
                        'Have them sign on screen. If that is awkward, attach a photo of a signed form instead.',
                    ] },
                    { type: 'p', text: 'The drive stays **Pending Signature** until the signature or the photo is in. Then you can mark it **Confirmed**.' },
                ],
            },
            {
                heading: 'After the appointment',
                blocks: [
                    { type: 'table', columns: ['Status', 'When to use it'], rows: [
                        ['Pending Signature', 'Booked, signature still missing.'],
                        ['Confirmed', 'Signed and approved to go out.'],
                        ['In Progress', 'They are out with the vehicle now.'],
                        ['Completed', 'The vehicle is back.'],
                        ['No Show', 'They did not arrive. Write a note and set a new follow-up on the lead.'],
                        ['Cancelled', 'The appointment was called off.'],
                    ] },
                    { type: 'p', text: 'Filter the list by Today, This Week, or This Month when you are building the day’s schedule. The e-sign rate on this screen is the share of drives that have a signed waiver.' },
                ],
            },
        ],
        related: ['pipeline', 'vehicles', 'dashboard'],
    },
    {
        id: 'reservations',
        title: 'Reservations',
        summary: 'When money is down, tie it to one specific unit so that unit cannot be promised twice.',
        audience: 'Sales rep, sales manager, administrator',
        menu: 'Sales & Customer → Reservations',
        keywords: ['reservation', 'down payment', 'dp', 'unit', 'released', 'allocation'],
        sections: [
            {
                heading: 'Create a reservation',
                blocks: [
                    { type: 'steps', items: [
                        'Confirm the unit is **In Stock** in Vehicle Inventory. A sold, locked, or disposed unit cannot be reserved.',
                        'Open **Reservations** and choose **Create**.',
                        'Select the customer and the exact unit. If the customer is not in the system yet, add them first. See **Customers**.',
                        'Enter the amount, date, reference number, target release date, and remarks for the releasing team.',
                        'Save. The unit shows as allocated to that customer, with the reservation reference.',
                    ] },
                    { type: 'note', text: 'A reservation without a unit ID is incomplete. The allocation on the vehicle record is what stops a second sale.' },
                ],
            },
            {
                heading: 'Move the status',
                blocks: [
                    { type: 'table', columns: ['Status', 'Meaning'], rows: [
                        ['Pending', 'Recorded, not yet confirmed.'],
                        ['Confirmed', 'The hold is accepted. Set the unit sub-status to reserved with or without DP, so the yard knows.'],
                        ['Released', 'The unit has gone out. Finish the release steps on the vehicle record as well.'],
                        ['Cancelled', 'The hold is off. Put the unit back to In Stock if it should be sold again.'],
                    ] },
                ],
            },
        ],
        related: ['vehicles', 'customers', 'pipeline'],
    },
    {
        id: 'customers',
        title: 'Customers',
        summary: 'One record per person or company, used by sales and by the shop.',
        audience: 'Sales, service, parts (view), administrator',
        menu: 'Sales & Customer → Customer',
        keywords: ['customer', 'tin', 'viber', 'survey', 'fleet', 'owner'],
        sections: [
            {
                heading: 'Create the record',
                blocks: [
                    { type: 'steps', items: [
                        'Search **Customer** by name or phone before you add anyone.',
                        'Choose **Create** and enter the name, phone, and email.',
                        'Add the address. For a company, add the authorized signatory and their position.',
                        'For invoicing, enter the **TIN** and the government ID type and number.',
                        'Set the customer type: retail, fleet, PUV operator, AP dealer, or sub-dealer.',
                        'Tick **Prefers Viber** when that is how they want to be reached.',
                        'Choose the preferred Wuling model if they have one.',
                        'Save.',
                    ] },
                    { type: 'p', text: 'One customer can own more than one vehicle. Link each unit from the vehicle record when it is sold, rather than creating a second customer.' },
                ],
            },
            {
                heading: 'Send a satisfaction survey',
                blocks: [
                    { type: 'steps', items: [
                        'Open the customer.',
                        'Generate the survey. You need permission to send surveys.',
                        'Send it by email from the same page, or copy the link.',
                        'The customer opens the link in a browser. They do not need an account. The link expires.',
                    ] },
                    { type: 'p', text: 'Answers show up in performance metrics for people who can see reports.' },
                ],
            },
        ],
        related: ['leads', 'reservations', 'vehicles', 'metrics'],
    },
    {
        id: 'vehicle-models',
        title: 'Vehicle models',
        summary: 'The catalog of what you sell. Units in the yard point back to a model.',
        audience: 'Inventory, administrator',
        menu: 'Inventory Management → Vehicle Models',
        keywords: ['model', 'catalog', 'manual', 'spec', 'variant'],
        sections: [
            {
                heading: 'Add a model',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Vehicle Models** and choose **Create**.',
                        'Enter the model name, year, and the variant details your sales team quotes.',
                        'Upload the spec sheet or owner’s manual on the model. Those files apply to every unit of that model.',
                        'Save. The model can now be selected when you receive a unit or when a customer names a preferred model.',
                    ] },
                    { type: 'note', text: 'Do not create a model record for each physical car. A model is the product. A unit is one VIN in Vehicle Inventory.' },
                ],
            },
        ],
        related: ['vehicles', 'leads'],
    },
    {
        id: 'vehicles',
        title: 'Vehicle inventory',
        summary: 'One record per physical unit, from arrival through reservation, release, and the sold file.',
        audience: 'Inventory, sales (as allowed), service (view), administrator',
        menu: 'Inventory Management → Vehicle Inventory',
        keywords: ['vin', 'stock', 'reserved', 'sold', 'lock', 'release', 'or/cr', 'warranty', 'lto'],
        sections: [
            {
                heading: 'Receive a unit',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Vehicle Inventory** and choose **Create**.',
                        'Select the **model**, then enter conduction number, VIN or chassis number, drive motor number, colors, and plate if it has one.',
                        'Set **location**: Branch, Warehouse, GBF, or Sold.',
                        'Set **status** to **In Stock** and sub-status to **None**.',
                        'Enter the price and any acquisition details your role is allowed to edit.',
                        'Save, then upload the spec sheet, DOE approval, and other receiving documents on the unit.',
                    ] },
                    { type: 'note', text: 'Sales roles cannot change cost fields. If a cost box is missing or will not save, that is the role, and accounting or an administrator should enter it.' },
                ],
            },
            {
                heading: 'Status and sub-status',
                blocks: [
                    { type: 'table', columns: ['Status', 'Use it when'], rows: [
                        ['In Stock', 'Available to sell or to reserve.'],
                        ['Reserved', 'Held for a customer. Always pair this with a reservation record.'],
                        ['Sold', 'The owner is tagged and the sale details are filled in. Sold requires an owner.'],
                        ['In Transit', 'Moving between locations.'],
                        ['Transferred', 'Sent to another branch. The receiving branch should see it on their list.'],
                        ['Disposed', 'No longer in the selling fleet.'],
                    ] },
                    { type: 'p', text: 'Sub-status adds the yard note: Reserved – with DP, Reserved – no DP, For LTO, For Release, For Body Repair, or For Inspection. Keep the sub-status current. It is what the releasing team reads.' },
                    { type: 'note', text: 'Lock the unit once it is reserved and paid. A locked unit cannot be reserved again. Unlock only if the deal falls through and the status goes back to In Stock.' },
                ],
            },
            {
                heading: 'Sell and release',
                blocks: [
                    { type: 'steps', items: [
                        'On the unit, set the owner to the customer record.',
                        'Enter the release date, payment method (cash, bank financing, or in-house), pricing (SRP, discount, net), down payment, and the balance financed.',
                        'For bank financing, record the bank, term, rate, and monthly amortization. For in-house, record the chattel mortgage details.',
                        'Add GPS, insurance, promo or freebies, and who shoulders the freebie cost (HQ, Cebu, or another dealer).',
                        'Upload proof of payment, the OR/CR scan, and the signed release papers.',
                        'Complete the release checklist: OR/CR ready, unit cleaned, payment verified, documents signed.',
                        'Ask an authorized person to approve the release. The approval stores who cleared it and when.',
                    ] },
                    { type: 'p', text: 'Warranty starts from the release. The end date is calculated for you. Type over it only when the contract uses a different term, and say why in the notes.' },
                    { type: 'p', text: 'A sold date can be saved only when the status is Sold.' },
                ],
            },
        ],
        related: ['reservations', 'vehicle-models', 'customers', 'work-orders'],
    },
    {
        id: 'parts',
        title: 'Parts and accessories',
        summary: 'Know what is on the shelf, what is low, and how to look a part up with the camera.',
        audience: 'Parts clerk, parts head, service (view), administrator',
        menu: 'Inventory Management → Parts & Accessories',
        keywords: ['parts', 'barcode', 'scanner', 'stock', 'reorder'],
        sections: [
            {
                heading: 'Add or update a part',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Parts & Accessories** and search the part number before you create a new row.',
                        'Choose **Create**. Enter the part number, description, category, cost, selling price, quantity on hand, and the reorder level.',
                        'Save. The list marks the part **Low Stock** when quantity falls to the reorder level, and **Out of Stock** when it hits zero.',
                        'When stock arrives, edit the part and add to the quantity. Do not create a second card for the same number.',
                    ] },
                ],
            },
            {
                heading: 'Status',
                blocks: [
                    { type: 'table', columns: ['Status', 'Meaning'], rows: [
                        ['Active', 'Can be issued to a work order.'],
                        ['Inactive', 'Temporarily not for sale or issue.'],
                        ['Discontinued', 'Do not reorder. Use up what remains, or write it off.'],
                        ['On Order', 'A replenishment is already placed.'],
                        ['Out of Stock', 'Nothing left to issue.'],
                    ] },
                ],
            },
            {
                heading: 'Use the scanner',
                blocks: [
                    { type: 'steps', items: [
                        'From the parts list, open the **scanner**. Allow the camera when the browser asks.',
                        'Point it at the barcode. The matching part opens.',
                        'Adjust the quantity from that screen if you are receiving or issuing.',
                        'The scans you make in that sitting stay in the session history so you can see what you already counted.',
                    ] },
                    { type: 'note', text: 'If the camera cannot read a code, type the part number into the parts search. The scanner is a shortcut, not the only way in.' },
                ],
            },
        ],
        related: ['work-orders', 'lists'],
    },
    {
        id: 'work-orders',
        title: 'PMS work orders',
        summary: 'Open a job, record the odometer, the parts, the labor, and the next service.',
        audience: 'Service manager, technician, administrator',
        menu: 'Operations → PMS Work Orders',
        keywords: ['pms', 'work order', 'odometer', 'job', 'mechanic', 'overdue'],
        sections: [
            {
                heading: 'Open a job',
                blocks: [
                    { type: 'steps', items: [
                        'Open **PMS Work Orders** and choose **Create**.',
                        'Select the vehicle and the customer. If they came from a sale, both should already exist.',
                        'Choose the job type: PMS, warranty, accident, or customer-pay.',
                        'Enter the request date, the schedule, the customer concern, and the current **odometer**.',
                        'Assign the technician.',
                        'Save. You get a work order number to write on the job folder.',
                    ] },
                ],
            },
            {
                heading: 'While the job is open',
                blocks: [
                    { type: 'bullets', items: [
                        'Add parts by part number and quantity. Prices come from parts inventory.',
                        'Record labor hours and labor cost. Use the start and end times so the actual duration is stored.',
                        'Upload photos of the concern and of the completed work.',
                        'Write repair details and any recurring issue in the notes.',
                    ] },
                    { type: 'table', columns: ['Status', 'Meaning'], rows: [
                        ['Draft', 'Started, not yet released to the shop.'],
                        ['Pending', 'Waiting to be scheduled.'],
                        ['Scheduled', 'A date is set.'],
                        ['Confirmed', 'The customer is expected.'],
                        ['In Progress', 'The technician is on it.'],
                        ['Completed', 'Work is done. Set the next PMS before you leave it.'],
                        ['Overdue', 'The promise date or the next service date has passed.'],
                        ['Cancelled', 'The job will not be done.'],
                    ] },
                ],
            },
            {
                heading: 'Odometer checks',
                blocks: [
                    { type: 'p', text: 'Each reading is compared with the last one for that VIN. The system flags a reading that went backwards, a reading that did not change, and a jump that averages more than about 500 km a day. A flagged job needs a supervisor to look at the photo of the cluster before you treat the mileage as true.' },
                    { type: 'p', text: 'When you complete the job, set the next service by date, by mileage, or both. That is what makes the next visit show up as due.' },
                ],
            },
        ],
        related: ['parts', 'warranty', 'vehicles', 'service-types'],
    },
    {
        id: 'service-types',
        title: 'Service types',
        summary: 'The categories of work the shop performs. Jobs and reports group by these.',
        audience: 'Service manager, administrator. Technicians can view.',
        menu: 'Operations → Service Types',
        keywords: ['service type', 'category', 'pms', 'labor'],
        sections: [
            {
                heading: 'Maintain the list',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Service Types**.',
                        'Create a type for each kind of work you schedule, such as periodic maintenance, warranty, or body repair.',
                        'Give it a clear name the technician will recognize on a work order.',
                        'Save. New work orders can then be classified with that type.',
                    ] },
                    { type: 'p', text: 'Edit a type when the name is wrong. Avoid deleting a type that old work orders still use. Mark it inactive if the screen offers that, so history stays readable.' },
                ],
            },
        ],
        related: ['common-services', 'work-orders'],
    },
    {
        id: 'common-services',
        title: 'Common services',
        summary: 'The priced menu: oil, filters, inspections, and the other jobs you quote every day.',
        audience: 'Service manager, administrator. Technicians can view.',
        menu: 'Operations → Common Services',
        keywords: ['common service', 'price', 'menu', 'peso', 'labor'],
        sections: [
            {
                heading: 'Add a menu item',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Common Services** and choose **Create**.',
                        'Enter the name, which service type it belongs to, and the price in pesos.',
                        'Save. Advisors use this list when they explain the cost of a visit.',
                    ] },
                    { type: 'note', text: 'A common service is a standard price. A work order is a visit. Put the actual parts and labor on the work order even when you started from a menu price.' },
                ],
            },
        ],
        related: ['service-types', 'work-orders'],
    },
    {
        id: 'warranty',
        title: 'Warranty claims',
        summary: 'Package the failed parts, the labor, and the photos into one claim and track it until it is paid or closed.',
        audience: 'Service manager, technician (create and view), parts (view), administrator',
        menu: 'Operations → Warranty Claims',
        keywords: ['warranty', 'claim', 'approved', 'rejected', 'manufacturer'],
        sections: [
            {
                heading: 'File a claim',
                blocks: [
                    { type: 'steps', items: [
                        'Confirm the unit is still inside the warranty dates on the vehicle record.',
                        'Open **Warranty Claims** and choose **Create**.',
                        'Select the vehicle, the customer, and the related work order if the repair is already open.',
                        'Choose the coverage: manufacturer, extended, or dealer.',
                        'Choose what you are claiming: parts only, labor only, or both.',
                        'Add each part and each service line, then upload photos of the failure and the repair.',
                        'Save as **Draft** until the file is complete, then set it to **Submitted**.',
                    ] },
                ],
            },
            {
                heading: 'Follow the decision',
                blocks: [
                    { type: 'table', columns: ['Status', 'Meaning'], rows: [
                        ['Draft', 'Still being assembled. Not sent.'],
                        ['Submitted', 'Waiting for review.'],
                        ['Under Review', 'Someone is checking the file.'],
                        ['Approved', 'The full claim is accepted.'],
                        ['Partially Approved', 'Some lines were accepted. Read the notes for what was cut.'],
                        ['Rejected', 'Not accepted. The note should say why.'],
                        ['Paid', 'The money or the credit has been received.'],
                        ['Closed', 'Finished, whether paid or not. Do not reopen it for a new failure. File a new claim.'],
                    ] },
                    { type: 'p', text: 'Use the status filter, then download, when you need a spreadsheet of claims in one state.' },
                ],
            },
        ],
        related: ['work-orders', 'vehicles', 'parts'],
    },
    {
        id: 'aftersales',
        title: 'Aftersales reports',
        summary: 'A summary of shop activity for managers who are allowed to see reports.',
        audience: 'Service manager, administrator, anyone with report access',
        menu: 'Operations → Aftersales Reports',
        keywords: ['aftersales', 'report', 'service summary'],
        sections: [
            {
                heading: 'Read the report',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Aftersales Reports**.',
                        'Set the branch and the date range. Your own branch is selected for you unless you can see all branches.',
                        'Use the totals to see volume, and open the underlying work orders when a number looks wrong.',
                    ] },
                    { type: 'note', text: 'This screen summarizes work that was entered on work orders. If a job was done but never written up, it will not appear here.' },
                ],
            },
        ],
        related: ['work-orders', 'metrics'],
    },
    {
        id: 'checklists',
        title: 'Checklists',
        summary: 'Standard steps for a job, such as releasing a vehicle, assigned to a person and a branch.',
        audience: 'Administrator, auditor, and anyone assigned an item',
        menu: 'Compliance & Quality → Checklists, and Checklist & Reminders',
        keywords: ['checklist', 'release', 'assignment', 'progress'],
        sections: [
            {
                heading: 'Complete items assigned to you',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Checklist & Reminders**, or use the checklist card on the dashboard.',
                        'Read the item, do the work, then tick it.',
                        'The assignment shows a percent complete so a supervisor can see what is left.',
                    ] },
                ],
            },
            {
                heading: 'Build a template',
                blocks: [
                    { type: 'p', text: 'People who manage checklists open **Checklists**, create a template, and add the steps in the order they must happen. Templates can be assigned when a matching event occurs, such as a release.' },
                    { type: 'p', text: 'The vehicle release checklist itself asks for OR/CR ready, unit cleaned, payment verified, and documents signed. Complete those on the unit, then have the release approved.' },
                ],
            },
        ],
        related: ['vehicles', 'reminders', 'dashboard'],
    },
    {
        id: 'reminders',
        title: 'Reminders',
        summary: 'Dated prompts that escalate when nobody acts.',
        audience: 'Administrator, auditor, and the people who receive them',
        menu: 'Compliance & Quality → Reminders',
        keywords: ['reminder', 'due', 'escalation'],
        sections: [
            {
                heading: 'Create a reminder',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Reminders** and choose **Create**.',
                        'Write a title a busy person will understand, such as “OR/CR follow-up for plate ABC 1234”.',
                        'Set the due date and who should act.',
                        'Save. It appears with the assignee’s other checklist and reminder items.',
                    ] },
                    { type: 'p', text: 'If a reminder is missed, the system can escalate it. Do not delete a reminder to hide a miss. Complete it, or write why it is no longer needed.' },
                ],
            },
        ],
        related: ['checklists', 'dashboard'],
    },
    {
        id: 'approvals',
        title: 'Supervisor approvals',
        summary: 'The queue for decisions that need a second person, including forced sign-out.',
        audience: 'Service manager, administrator, auditor',
        menu: 'Compliance & Quality → Supervisor Approvals',
        keywords: ['approval', 'supervisor', 'override'],
        sections: [
            {
                heading: 'Review the queue',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Supervisor Approvals**.',
                        'Read the request, including who asked and which record it concerns.',
                        'Approve only when you have checked the underlying record, such as the work order photos or the release checklist.',
                    ] },
                    { type: 'p', text: 'Odometer flags and release approval are the decisions that most often need this second look. Approving from the queue does not replace opening the record.' },
                ],
            },
        ],
        related: ['work-orders', 'vehicles', 'time-tracking'],
    },
    {
        id: 'metrics',
        title: 'Performance metrics',
        summary: 'How sales and customer satisfaction are moving, for people allowed to see reports.',
        audience: 'Managers, administrator, auditor',
        menu: 'Analytics & Reports → Performance Metrics',
        keywords: ['kpi', 'metrics', 'satisfaction', 'survey', 'performance'],
        sections: [
            {
                heading: 'Read the page',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Performance Metrics**.',
                        'Set the period. Compare it with the previous period of the same length before you call a change a trend.',
                        'Customer satisfaction comes from surveys customers actually submitted. A quiet week of surveys means a thin score, not necessarily a bad shop.',
                    ] },
                    { type: 'note', text: 'If a sales number disagrees with the pipeline, trust the deals and the sold units, then fix the missing stage updates. The metric only repeats what was saved.' },
                ],
            },
        ],
        related: ['customers', 'pipeline', 'aftersales'],
    },
    {
        id: 'activity-logs',
        title: 'Activity logs',
        summary: 'Who changed a record, what changed, and when.',
        audience: 'Managers, auditor, administrator',
        menu: 'Analytics & Reports → Activity Logs',
        keywords: ['audit', 'history', 'activity', 'who changed'],
        sections: [
            {
                heading: 'Look up a change',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Activity Logs**.',
                        'Search the customer, unit, lead, or user name.',
                        'Filter by date or by branch if you can see more than one branch.',
                        'Open the row to see the before and after.',
                    ] },
                    { type: 'p', text: 'Use this when a status, a price, or a branch assignment is not what you remember. You can download the filtered log if your role includes export.' },
                    { type: 'note', text: 'The log is a history, not an undo button. To put a record back, edit it or restore it from its own list.' },
                ],
            },
        ],
        related: ['lists', 'users', 'time-tracking'],
    },
    {
        id: 'time-tracking',
        title: 'Time tracking',
        summary: 'Sign-in history, and the control a supervisor uses to close an unused session.',
        audience: 'Managers, auditor, administrator',
        menu: 'Analytics & Reports → Time Tracking',
        keywords: ['time tracking', 'idle', 'session', 'force logout'],
        sections: [
            {
                heading: 'Review sessions',
                blocks: [
                    { type: 'p', text: 'The list shows when people signed in, from where, and whether the session is still open, ended normally, closed for being idle, or closed by a supervisor.' },
                    { type: 'steps', items: [
                        'Open **Time Tracking**.',
                        'Find the person and the day.',
                        'If a session is still open and the person has left, a supervisor can force the sign-out.',
                    ] },
                ],
            },
            {
                heading: 'Idle settings',
                blocks: [
                    { type: 'p', text: 'A supervisor with the right permission can set how long an unused session stays open, and how long before a warning. Save the settings on this page. They apply across the system, not only to one user.' },
                    { type: 'note', text: 'Tell the team before you shorten the idle time. People in the middle of a long form will be signed out and will need to sign in again.' },
                ],
            },
        ],
        related: ['sign-in', 'approvals', 'activity-logs'],
    },
    {
        id: 'users',
        title: 'User management',
        summary: 'Create the account, put the person in a branch, and give them a role.',
        audience: 'Administrator',
        menu: 'Administration → User Management',
        keywords: ['user', 'account', 'role', 'branch', 'password'],
        sections: [
            {
                heading: 'Add a person',
                blocks: [
                    { type: 'steps', items: [
                        'Open **User Management** and choose **Create**.',
                        'Enter the name and the email they will use to sign in. The email must be one they can open, because password resets go there.',
                        'Choose the **branch**. This is which records they will see.',
                        'Choose the **role**. This is which menus they will see.',
                        'Set a temporary password and tell them to sign in and change it from **Settings**.',
                        'Save.',
                    ] },
                    { type: 'note', text: 'A person in the wrong branch will think records are missing. Check the branch before you change their role.' },
                ],
            },
            {
                heading: 'When someone leaves',
                blocks: [
                    { type: 'p', text: 'Remove their access the same day. Deleting the user hides the account and keeps the history of what they changed. You can restore the account if they return.' },
                ],
            },
        ],
        related: ['roles', 'branches', 'sign-in'],
    },
    {
        id: 'branches',
        title: 'Branch management',
        summary: 'Each dealership location is a branch. Records hang off the branch you assign.',
        audience: 'Administrator',
        menu: 'Administration → Branch Management',
        keywords: ['branch', 'location', 'address', 'active'],
        sections: [
            {
                heading: 'Keep a branch current',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Branch Management**.',
                        'Create a branch with a name and a short code people will recognize on filters.',
                        'Enter the address, city, phone, and email.',
                        'Leave the status **Active** while the branch operates. Set it inactive when the location closes, after its users have been moved.',
                        'Save.',
                    ] },
                    { type: 'p', text: 'Users only see data for their branch. Moving a lead or a unit between branches is a separate action on that record, done by an administrator or by someone with reassignment permission. Changing the branch address does not move the records.' },
                ],
            },
        ],
        related: ['users', 'leads', 'vehicles'],
    },
    {
        id: 'roles',
        title: 'Roles and permissions',
        summary: 'A role is a bundle of permissions. Change it when a job changes, not to fix one missing button in a hurry.',
        audience: 'Administrator',
        menu: 'Administration → Roles & Permissions',
        keywords: ['role', 'permission', 'access', 'mfa', 'delete'],
        sections: [
            {
                heading: 'What the usual roles are for',
                blocks: [
                    { type: 'table', columns: ['Role', 'Typical work'], rows: [
                        ['Sales rep', 'Leads, pipeline, test drives, reservations, customers.'],
                        ['Sales manager', 'The same, plus performance metrics and team visibility.'],
                        ['Service manager', 'Work orders, service menu, warranty, and shop reports.'],
                        ['Technician', 'Work orders and a view of parts, warranty, and service menu items.'],
                        ['Parts clerk / parts head', 'Parts stock. Parts head maintains the catalog. Both can view warranty lines.'],
                        ['Auditor', 'Review across every branch, including activity logs. Not for day-to-day data entry.'],
                        ['Administrator', 'Users, branches, roles, and every module.'],
                    ] },
                ],
            },
            {
                heading: 'Change access',
                blocks: [
                    { type: 'steps', items: [
                        'Open **Roles**. Prefer editing the role the job uses, so the next person in that job gets the same access.',
                        'Tick only the permissions that job needs: view, create, edit, delete, export, or a special action such as approving a release.',
                        'Save, then ask the person to sign out and back in if their menu does not update.',
                    ] },
                    { type: 'note', text: 'Deleting a role or a permission sends a code to your email. Enter the code to finish. If you did not ask for the code, do not enter it, and change your password.' },
                ],
            },
        ],
        related: ['users', 'sign-in', 'activity-logs'],
    },
];

export function findArticle(id: string): GuideArticle | undefined {
    return guideArticles.find((article) => article.id === id);
}

export function groupForArticle(id: string): GuideGroup | undefined {
    return guideGroups.find((group) => group.articles.includes(id));
}
