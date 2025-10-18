import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import { Bell, Car, Shield, TrendingUp } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface AuthTwoColumnLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthTwoColumnLayout({ 
    children, 
    title, 
    description 
}: PropsWithChildren<AuthTwoColumnLayoutProps>) {
    const announcements = [
        {
            icon: TrendingUp,
            title: "System Update",
            description: "Enhanced reporting features now available",
            date: "Oct 15, 2025"
        },
        {
            icon: Shield,
            title: "Security Enhancement",
            description: "Multi-factor authentication is now enabled for all users",
            date: "Oct 10, 2025"
        },
        {
            icon: Car,
            title: "New Feature",
            description: "Real-time inventory tracking with automated alerts",
            date: "Oct 5, 2025"
        }
    ];

    return (
        <div className="flex min-h-screen">
            {/* Left Column - Login Form */}
            <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-20">
                <div className="mx-auto w-full max-w-md">
                    {/* Logo */}
                    <div className="mb-8">
                        <Link href={route('home')} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#036635]">
                                <Car className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Craphify ERP</h1>
                                <p className="text-sm text-gray-500">Dealership Management</p>
                            </div>
                        </Link>
                    </div>

                    {/* Title & Description */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                        <p className="mt-2 text-sm text-gray-600">{description}</p>
                    </div>

                    {/* Form Content */}
                    {children}
                </div>
            </div>

            {/* Right Column - Announcements */}
            <div 
                className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-16"
                style={{ backgroundColor: '#036635' }}
            >
                <div className="max-w-xl">
                    {/* Header */}
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <Bell className="h-8 w-8 text-white" />
                            <h2 className="text-3xl font-bold text-white">
                                Latest Updates
                            </h2>
                        </div>
                        <p className="text-lg text-white/90">
                            Stay informed with the latest features and system announcements
                        </p>
                    </div>

                    {/* Announcements List */}
                    <div className="space-y-6">
                        {announcements.map((announcement, index) => {
                            const Icon = announcement.icon;
                            return (
                                <div 
                                    key={index}
                                    className="rounded-xl bg-white/10 p-6 backdrop-blur-sm transition-all hover:bg-white/15"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white">
                                                {announcement.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-white/80">
                                                {announcement.description}
                                            </p>
                                            <p className="mt-2 text-xs text-white/60">
                                                {announcement.date}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-12 rounded-xl border border-white/20 bg-white/5 p-6 backdrop-blur-sm">
                        <p className="text-sm text-white/90">
                            <span className="font-semibold">Need help?</span> Contact your system administrator or IT support team for assistance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
