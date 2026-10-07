import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <span className="flex h-8 w-14 shrink-0 items-center justify-center group-data-[collapsible=icon]:w-8">
                <AppLogoIcon className="h-7 w-auto group-data-[collapsible=icon]:h-4" />
            </span>
            <span className="sr-only">Wuling</span>
            <span className="truncate leading-tight font-semibold group-data-[collapsible=icon]:hidden" aria-hidden="true">
                Wuling
            </span>
        </>
    );
}
