import { Head, Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

const sections = [
    { id: 'immediate', label: 'Immediate' },
    { id: 'mid-term', label: 'Mid-term' },
    { id: 'later', label: 'Later' },
    { id: 'pilot', label: 'Pilot' },
];

const immediate = [
    ['People and access', 'Sign-in, branches, and roles. A code is required only when someone deletes a sensitive record.'],
    ['Sales', 'Leads with CSV import, the pipeline, the test-drive calendar, e-signature, the insurance check, and reservations tied to a specific unit.'],
    ['Customers', 'Customer records, the Viber flag, +63 phone numbers, and a public survey link. Existing Google Forms stay as they are for this round.'],
    ['Inventory', 'Models and units, location and status, lock after a reservation, the release checklist, documents, and warranty dates. Parts list and barcode scan.'],
    ['Service', 'Live PMS work orders, service types, common services, warranty claims, and the aftersales report.'],
    ['Control', 'Checklists, reminders, performance metrics, the activity log, and time tracking. CSV export for leads, warranty, parts, and work orders.'],
    ['Help', 'A public user guide that does not need a login, and Send feedback inside the app for anything found during the pilot.'],
];

const midTerm = [
    ['Supervisor approvals', 'The screen is in the app and still shows sample records. It is not part of the pilot.'],
    ['A code at every login', 'Email one-time codes are built and left off, so sign-in stays a normal password.'],
    ['A few vehicle badges', 'Featured, online listing, allow test drive, and priority on the unit page are not live fields yet.'],
    ['Google Forms', 'The in-app survey is ready when the current forms process is settled. This rollout does not replace the forms.'],
    ['Messages to customers', 'SMS and email reminder choices are stored on the customer. Nothing is sent yet.'],
];

const later = [
    ['LTO, banks, and financing systems', 'Staff record the numbers on the unit and the reservation.'],
    ['SMS gateway and due-date alerts', 'The preference is stored. There is no message provider yet.'],
    ['Accounting and BIR invoicing', 'An accounting role exists. There is no books module.'],
    ['Public listings and a mobile app', 'Not in this build. A test drive does not include live GPS tracking.'],
    ['Retiring Google Forms', 'Only after the process loop is finished and the in-app survey is chosen.'],
];

const walkthrough = [
    'A walk-in lead',
    'The same person on the pipeline',
    'A test drive, including the signature',
    'A reservation on a real unit',
    'The unit locked, with the release checklist',
    'A PMS work order on that unit',
];

export default function Roadmap() {
    const { auth } = usePage<SharedData>().props;
    const signedIn = Boolean(auth?.user);

    return (
        <>
            <Head title="Rollout update" />
            <div className="min-h-screen bg-[#f3f3f3] text-[#181818]">
                <header className="border-b border-[#e5e5e5] bg-white print:hidden">
                    <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
                        <div className="flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center rounded-md bg-[#036635] text-xs font-semibold text-white">M</span>
                            <div>
                                <p className="text-sm font-semibold">MIKARO ERP</p>
                                <p className="text-xs text-[#706e6b]">Rollout update</p>
                            </div>
                        </div>
                        <nav className="hidden items-center gap-4 text-sm md:flex">
                            {sections.map((section) => (
                                <a key={section.id} href={`#${section.id}`} className="text-[#3e3e3c] hover:text-[#036635]">
                                    {section.label}
                                </a>
                            ))}
                        </nav>
                        <Link
                            href={signedIn ? route('dashboard') : route('login')}
                            className="rounded-md border border-[#c9c9c9] bg-white px-3 py-1.5 text-sm font-medium hover:bg-[#f3f3f3]"
                        >
                            {signedIn ? 'Back to app' : 'Sign in'}
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-5xl px-5 py-10">
                    <p className="text-xs font-semibold tracking-wide text-[#036635] uppercase">October 2026</p>
                    <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight">What can go live, and what waits</h1>
                    <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[#3e3e3c]">
                        Staff can run a dealership day in MIKARO ERP now: a lead, the pipeline, a test drive, a reservation, the vehicle itself, then service. The note below groups that work the way it was requested. Google Forms stay with the team for this round.
                    </p>

                    <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <a href="#immediate" className="rounded-md border border-[#e5e5e5] bg-white p-4 hover:border-[#036635]">
                            <p className="text-xs font-semibold tracking-wide text-[#036635] uppercase">About 1 week</p>
                            <p className="mt-1 text-lg font-semibold">Pilot the daily loop</p>
                            <p className="mt-1 text-sm leading-6 text-[#3e3e3c]">One branch, named users, real units.</p>
                        </a>
                        <a href="#mid-term" className="rounded-md border border-[#e5e5e5] bg-white p-4 hover:border-[#036635]">
                            <p className="text-xs font-semibold tracking-wide text-[#706e6b] uppercase">1–2 months</p>
                            <p className="mt-1 text-lg font-semibold">Finish what is still a sample</p>
                            <p className="mt-1 text-sm leading-6 text-[#3e3e3c]">Approvals, login codes, and customer messages.</p>
                        </a>
                        <a href="#later" className="rounded-md border border-[#e5e5e5] bg-white p-4 hover:border-[#036635]">
                            <p className="text-xs font-semibold tracking-wide text-[#706e6b] uppercase">3+ months</p>
                            <p className="mt-1 text-lg font-semibold">Outside systems stay manual</p>
                            <p className="mt-1 text-sm leading-6 text-[#3e3e3c]">LTO, banks, accounting, and a mobile app.</p>
                        </a>
                    </div>

                    <section id="immediate" className="mt-12 scroll-mt-6">
                        <h2 className="text-xl font-semibold">Immediate, about one week</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#3e3e3c]">Ready to pilot. This is the walkthrough.</p>
                        <div className="mt-4 overflow-hidden rounded-md border border-[#e5e5e5] bg-white">
                            {immediate.map(([title, detail]) => (
                                <div key={title} className="grid gap-1 border-b border-[#e5e5e5] px-4 py-3 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
                                    <p className="text-sm font-semibold">{title}</p>
                                    <p className="text-sm leading-6 text-[#3e3e3c]">{detail}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="mid-term" className="mt-12 scroll-mt-6">
                        <h2 className="text-xl font-semibold">Mid-term, one to two months</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#3e3e3c]">In the product, and not part of the first pilot.</p>
                        <div className="mt-4 overflow-hidden rounded-md border border-[#e5e5e5] bg-white">
                            {midTerm.map(([title, detail]) => (
                                <div key={title} className="grid gap-1 border-b border-[#e5e5e5] px-4 py-3 last:border-b-0 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-4">
                                    <p className="text-sm font-semibold">{title}</p>
                                    <p className="text-sm leading-6 text-[#3e3e3c]">{detail}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="later" className="mt-12 scroll-mt-6">
                        <h2 className="text-xl font-semibold">Longer lead, three months and after</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#3e3e3c]">Staff type these details in today. This round does not connect an outside system.</p>
                        <div className="mt-4 overflow-hidden rounded-md border border-[#e5e5e5] bg-white">
                            {later.map(([title, detail]) => (
                                <div key={title} className="grid gap-1 border-b border-[#e5e5e5] px-4 py-3 last:border-b-0 sm:grid-cols-[14rem_minmax(0,1fr)] sm:gap-4">
                                    <p className="text-sm font-semibold">{title}</p>
                                    <p className="text-sm leading-6 text-[#3e3e3c]">{detail}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section id="pilot" className="mt-12 scroll-mt-6 rounded-md border border-[#e5e5e5] bg-white p-5">
                        <h2 className="text-xl font-semibold">What the pilot asks for</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#3e3e3c]">
                            One branch for next week. The people who will use it, their roles, and a starter list of models and units. Those people get the public guide. Fixes go through Send feedback. Google Forms and login codes stay as they are.
                        </p>
                        <h3 className="mt-6 text-sm font-semibold">The walkthrough follows one customer</h3>
                        <ol className="mt-3 space-y-2">
                            {walkthrough.map((step, index) => (
                                <li key={step} className="flex gap-3 text-sm leading-6 text-[#3e3e3c]">
                                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#036635] text-xs font-semibold text-white">
                                        {index + 1}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </section>
                </main>
            </div>
        </>
    );
}
