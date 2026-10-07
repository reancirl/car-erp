import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { CarFront, ClipboardList, Wrench } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthTwoColumnLayoutProps {
    title?: string;
    description?: string;
}

const capabilities = [
    {
        icon: ClipboardList,
        title: 'Sales floor',
        description: 'Leads, the pipeline, test drives, and a reservation on a specific unit.',
    },
    {
        icon: CarFront,
        title: 'Yard and documents',
        description: 'Models, stock, location, and the release checklist before a unit leaves.',
    },
    {
        icon: Wrench,
        title: 'Aftersales',
        description: 'Work orders and warranty claims stay with the same vehicle.',
    },
];

export default function AuthTwoColumnLayout({ children, title, description }: PropsWithChildren<AuthTwoColumnLayoutProps>) {
    return (
        <div className="flex min-h-screen bg-background">
            <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-[46%] lg:px-16 xl:px-24">
                <div className="mx-auto w-full max-w-[26rem]">
                    <div className="mb-10">
                        <Link href={route('home')} className="inline-flex items-center gap-3">
                            <AppLogoIcon className="h-9 w-auto" />
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight text-foreground">Wuling</h1>
                                <p className="text-xs tracking-wide text-muted-foreground uppercase">Dealership system</p>
                            </div>
                        </Link>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-[1.75rem] leading-tight font-semibold tracking-tight text-foreground">{title}</h2>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                    </div>

                    {children}
                </div>
            </div>

            <aside className="relative hidden flex-1 flex-col justify-between bg-[#141414] px-14 py-16 text-white lg:flex xl:px-20">
                <div className="absolute inset-y-0 left-0 w-1 bg-[#EE2C1E]" aria-hidden="true" />

                <div>
                    <p className="text-xs font-medium tracking-[0.18em] text-[#EE2C1E] uppercase">Wuling</p>
                    <h2 className="mt-4 max-w-md text-4xl leading-[1.15] font-semibold tracking-tight">
                        The daily work of the dealership, in one place.
                    </h2>
                    <p className="mt-5 max-w-md text-[15px] leading-7 text-white/70">
                        Staff follow a customer and a unit from the first visit through delivery and service. Each step stays on the same record.
                    </p>
                </div>

                <ul className="my-12 max-w-lg divide-y divide-white/10 border-y border-white/10">
                    {capabilities.map((item) => {
                        const Icon = item.icon;

                        return (
                            <li key={item.title} className="flex gap-4 py-5">
                                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-white/8 text-[#EE2C1E]">
                                    <Icon className="size-4" />
                                </span>
                                <span>
                                    <span className="block text-sm font-medium">{item.title}</span>
                                    <span className="mt-1 block text-sm leading-6 text-white/65">{item.description}</span>
                                </span>
                            </li>
                        );
                    })}
                </ul>

                <p className="max-w-md text-sm leading-6 text-white/55">
                    Access is issued by your administrator. The staff guide is available before you sign in.
                </p>
            </aside>
        </div>
    );
}
