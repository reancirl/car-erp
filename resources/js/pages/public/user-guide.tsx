import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronRight, Copy, Printer, Search } from 'lucide-react';
import { findArticle, groupForArticle, guideArticles, guideGroups, type Block, type GuideArticle } from '@/pages/public/guide-content';
import { FormEvent, useEffect, useMemo, useState } from 'react';

function RichText({ text }: { text: string }) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);

    return (
        <>
            {parts.map((part, index) =>
                part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={index} className="font-semibold text-[#181818]">
                        {part.slice(2, -2)}
                    </strong>
                ) : (
                    <span key={index}>{part}</span>
                ),
            )}
        </>
    );
}

function ArticleBlocks({ blocks }: { blocks: Block[] }) {
    return (
        <div className="space-y-4">
            {blocks.map((block, index) => {
                if (block.type === 'p') {
                    return (
                        <p key={index} className="text-[15px] leading-7 text-[#3e3e3c]">
                            <RichText text={block.text} />
                        </p>
                    );
                }

                if (block.type === 'steps') {
                    return (
                        <ol key={index} className="space-y-3">
                            {block.items.map((item, step) => (
                                <li key={step} className="flex gap-3 text-[15px] leading-6 text-[#3e3e3c]">
                                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#036635] text-xs font-semibold text-white">
                                        {step + 1}
                                    </span>
                                    <span>
                                        <RichText text={item} />
                                    </span>
                                </li>
                            ))}
                        </ol>
                    );
                }

                if (block.type === 'bullets') {
                    return (
                        <ul key={index} className="space-y-2 pl-1">
                            {block.items.map((item, itemIndex) => (
                                <li key={itemIndex} className="flex gap-2 text-[15px] leading-6 text-[#3e3e3c]">
                                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#036635]" />
                                    <span>
                                        <RichText text={item} />
                                    </span>
                                </li>
                            ))}
                        </ul>
                    );
                }

                if (block.type === 'note') {
                    return (
                        <div key={index} className="border-l-4 border-[#036635] bg-[#f3faf6] px-4 py-3 text-sm leading-6 text-[#1b3a2a]">
                            <RichText text={block.text} />
                        </div>
                    );
                }

                return (
                    <div key={index} className="overflow-x-auto rounded-md border border-[#e5e5e5]">
                        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
                            <thead className="bg-[#f3f3f3] text-xs tracking-wide text-[#444] uppercase">
                                <tr>
                                    <th className="px-4 py-2.5 font-semibold">{block.columns[0]}</th>
                                    <th className="px-4 py-2.5 font-semibold">{block.columns[1]}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {block.rows.map((row) => (
                                    <tr key={row[0]} className="border-t border-[#e5e5e5]">
                                        <td className="px-4 py-2.5 font-medium text-[#181818]">{row[0]}</td>
                                        <td className="px-4 py-2.5 text-[#3e3e3c]">{row[1]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            })}
        </div>
    );
}

function articleText(article: GuideArticle): string {
    return [
        article.title,
        article.summary,
        article.menu,
        article.keywords.join(' '),
        ...article.sections.flatMap((section) => [
            section.heading,
            ...section.blocks.flatMap((block) => {
                if (block.type === 'p' || block.type === 'note') return [block.text];
                if (block.type === 'steps' || block.type === 'bullets') return block.items;
                return block.rows.flat();
            }),
        ]),
    ]
        .join(' ')
        .toLowerCase();
}

export default function UserGuide() {
    const { auth } = usePage<SharedData>().props;
    const signedIn = Boolean(auth?.user);
    const [query, setQuery] = useState('');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const readHash = () => {
            const id = window.location.hash.replace('#', '');
            setActiveId(id && findArticle(id) ? id : null);
        };

        readHash();
        window.addEventListener('hashchange', readHash);
        return () => window.removeEventListener('hashchange', readHash);
    }, []);

    useEffect(() => {
        document.getElementById('guide-article')?.scrollTo({ top: 0 });
    }, [activeId, query]);

    const results = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (term.length < 2) return [];

        return guideArticles.filter((article) => articleText(article).includes(term));
    }, [query]);

    const article = activeId ? findArticle(activeId) : undefined;
    const group = article ? groupForArticle(article.id) : undefined;
    const searching = query.trim().length >= 2;

    const openArticle = (id: string) => {
        setQuery('');
        setActiveId(id);
        window.history.replaceState(null, '', `${window.location.pathname}#${id}`);
    };

    const showHome = () => {
        setQuery('');
        setActiveId(null);
        window.history.replaceState(null, '', window.location.pathname);
    };

    const copyLink = async () => {
        if (!article) return;
        const url = `${window.location.origin}${window.location.pathname}#${article.id}`;
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
    };

    const onSearch = (event: FormEvent) => {
        event.preventDefault();
        if (results.length === 1) openArticle(results[0].id);
    };

    return (
        <>
            <Head title="Help" />
            <div className="flex h-screen flex-col bg-[#f3f3f3] text-[#181818]">
                <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[#e5e5e5] bg-white px-4 print:hidden">
                    <button type="button" onClick={showHome} className="flex items-center gap-2">
                        <AppLogoIcon className="h-8 w-auto" />
                        <span className="hidden text-left sm:block">
                            <span className="block text-sm leading-tight font-semibold">Wuling Help</span>
                            <span className="block text-[11px] text-[#706e6b]">Staff reference</span>
                        </span>
                    </button>

                    <form onSubmit={onSearch} className="relative mx-auto w-full max-w-xl">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#706e6b]" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search articles, for example warranty, VIN, reservation"
                            className="h-9 w-full rounded-md border border-[#c9c9c9] bg-white pr-3 pl-9 text-sm outline-none focus:border-[#036635] focus:ring-2 focus:ring-[#036635]/20"
                            aria-label="Search help articles"
                        />
                    </form>

                    <Link
                        href={signedIn ? route('dashboard') : route('login')}
                        className="shrink-0 rounded-md border border-[#c9c9c9] bg-white px-3 py-1.5 text-sm font-medium hover:bg-[#f3f3f3]"
                    >
                        {signedIn ? 'Back to app' : 'Sign in'}
                    </Link>
                </header>

                <div className="grid min-h-0 flex-1 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="hidden overflow-y-auto border-r border-[#e5e5e5] bg-white lg:block print:hidden">
                        <nav className="py-3">
                            {guideGroups.map((item) => (
                                <div key={item.id} className="mb-2">
                                    <p className="px-4 py-2 text-[11px] font-semibold tracking-wide text-[#706e6b] uppercase">{item.label}</p>
                                    <ul>
                                        {item.articles.map((id) => {
                                            const entry = findArticle(id);
                                            if (!entry) return null;
                                            const selected = entry.id === activeId && !searching;

                                            return (
                                                <li key={id}>
                                                    <button
                                                        type="button"
                                                        onClick={() => openArticle(id)}
                                                        className={`flex w-full items-center border-l-2 px-4 py-1.5 text-left text-sm ${
                                                            selected
                                                                ? 'border-[#036635] bg-[#f3faf6] font-medium text-[#036635]'
                                                                : 'border-transparent text-[#181818] hover:bg-[#f3f3f3]'
                                                        }`}
                                                    >
                                                        {entry.title}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </aside>

                    <main id="guide-article" className="overflow-y-auto">
                        <div className="border-b border-[#e5e5e5] bg-white px-4 py-3 lg:hidden print:hidden">
                            <label className="mb-1 block text-xs font-medium text-[#706e6b]" htmlFor="article-jump">
                                Jump to an article
                            </label>
                            <select
                                id="article-jump"
                                className="h-9 w-full rounded-md border border-[#c9c9c9] bg-white px-2 text-sm"
                                value={activeId ?? ''}
                                onChange={(event) => {
                                    if (event.target.value) openArticle(event.target.value);
                                    else showHome();
                                }}
                            >
                                <option value="">All topics</option>
                                {guideGroups.map((item) => (
                                    <optgroup key={item.id} label={item.label}>
                                        {item.articles.map((id) => {
                                            const entry = findArticle(id);
                                            return entry ? (
                                                <option key={id} value={id}>
                                                    {entry.title}
                                                </option>
                                            ) : null;
                                        })}
                                    </optgroup>
                                ))}
                            </select>
                        </div>

                        {searching ? (
                            <div className="mx-auto max-w-3xl px-5 py-8">
                                <h1 className="text-2xl font-semibold">Search results</h1>
                                <p className="mt-1 text-sm text-[#706e6b]">
                                    {results.length} {results.length === 1 ? 'article' : 'articles'} for “{query.trim()}”
                                </p>
                                <ul className="mt-6 divide-y divide-[#e5e5e5] rounded-md border border-[#e5e5e5] bg-white">
                                    {results.length === 0 ? (
                                        <li className="px-5 py-8 text-sm text-[#3e3e3c]">
                                            Nothing matched. Try a word from the screen, such as lead, odometer, or branch.
                                        </li>
                                    ) : (
                                        results.map((entry) => (
                                            <li key={entry.id}>
                                                <button type="button" onClick={() => openArticle(entry.id)} className="block w-full px-5 py-4 text-left hover:bg-[#f8f8f8]">
                                                    <span className="text-xs font-medium tracking-wide text-[#036635] uppercase">
                                                        {groupForArticle(entry.id)?.label}
                                                    </span>
                                                    <span className="mt-1 block text-base font-semibold">{entry.title}</span>
                                                    <span className="mt-1 block text-sm leading-6 text-[#3e3e3c]">{entry.summary}</span>
                                                </button>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </div>
                        ) : article && group ? (
                            <article className="mx-auto max-w-3xl px-5 py-8">
                                <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-[#706e6b] print:hidden">
                                    <button type="button" onClick={showHome} className="hover:text-[#036635]">
                                        Help
                                    </button>
                                    <ChevronRight className="size-3" />
                                    <span>{group.label}</span>
                                    <ChevronRight className="size-3" />
                                    <span className="text-[#181818]">{article.title}</span>
                                </nav>

                                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold tracking-wide text-[#036635] uppercase">{group.label}</p>
                                        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{article.title}</h1>
                                        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#3e3e3c]">{article.summary}</p>
                                    </div>
                                    <div className="flex gap-2 print:hidden">
                                        <button
                                            type="button"
                                            onClick={copyLink}
                                            className="inline-flex items-center gap-1.5 rounded-md border border-[#c9c9c9] bg-white px-3 py-1.5 text-sm hover:bg-[#f3f3f3]"
                                        >
                                            <Copy className="size-3.5" />
                                            {copied ? 'Copied' : 'Copy link'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="inline-flex items-center gap-1.5 rounded-md border border-[#c9c9c9] bg-white px-3 py-1.5 text-sm hover:bg-[#f3f3f3]"
                                        >
                                            <Printer className="size-3.5" />
                                            Print
                                        </button>
                                    </div>
                                </div>

                                <dl className="mb-8 grid gap-3 rounded-md border border-[#e5e5e5] bg-white p-4 text-sm sm:grid-cols-2">
                                    <div>
                                        <dt className="text-xs font-semibold tracking-wide text-[#706e6b] uppercase">Who this is for</dt>
                                        <dd className="mt-1">{article.audience}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs font-semibold tracking-wide text-[#706e6b] uppercase">Where to go</dt>
                                        <dd className="mt-1">{article.menu}</dd>
                                    </div>
                                </dl>

                                <div className="mb-8 rounded-md border border-[#e5e5e5] bg-white p-4 print:hidden">
                                    <p className="text-xs font-semibold tracking-wide text-[#706e6b] uppercase">In this article</p>
                                    <ol className="mt-2 space-y-1">
                                        {article.sections.map((section, index) => (
                                            <li key={section.heading}>
                                                <a href={`#${article.id}-${index}`} className="text-sm text-[#036635] hover:underline">
                                                    {index + 1}. {section.heading}
                                                </a>
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                <div className="space-y-10">
                                    {article.sections.map((section, index) => (
                                        <section key={section.heading} id={`${article.id}-${index}`} className="scroll-mt-6">
                                            <h2 className="mb-4 border-b border-[#e5e5e5] pb-2 text-xl font-semibold">{section.heading}</h2>
                                            <ArticleBlocks blocks={section.blocks} />
                                        </section>
                                    ))}
                                </div>

                                {article.related.length > 0 && (
                                    <div className="mt-12 border-t border-[#e5e5e5] pt-6 print:hidden">
                                        <h2 className="text-sm font-semibold tracking-wide text-[#706e6b] uppercase">Related articles</h2>
                                        <ul className="mt-3 divide-y divide-[#e5e5e5] rounded-md border border-[#e5e5e5] bg-white">
                                            {article.related.map((id) => {
                                                const related = findArticle(id);
                                                if (!related) return null;

                                                return (
                                                    <li key={id}>
                                                        <button type="button" onClick={() => openArticle(id)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#f8f8f8]">
                                                            <span>
                                                                <span className="block text-sm font-medium">{related.title}</span>
                                                                <span className="block text-xs text-[#706e6b]">{related.summary}</span>
                                                            </span>
                                                            <ChevronRight className="size-4 shrink-0 text-[#706e6b]" />
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}
                            </article>
                        ) : (
                            <div className="mx-auto max-w-5xl px-5 py-8">
                                <p className="text-xs font-semibold tracking-wide text-[#036635] uppercase">Wuling</p>
                                <h1 className="mt-1 text-3xl font-semibold tracking-tight">How can we help?</h1>
                                <p className="mt-2 max-w-2xl text-[15px] leading-7 text-[#3e3e3c]">
                                    Look up the screen you have open. Each article tells you who it is for, which menu to use, and the exact steps and statuses.
                                </p>
                                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                    {guideGroups.map((item) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => openArticle(item.articles[0])}
                                            className="rounded-md border border-[#e5e5e5] bg-white p-5 text-left shadow-sm hover:border-[#036635]"
                                        >
                                            <span className="text-base font-semibold">{item.label}</span>
                                            <span className="mt-1 block text-sm leading-6 text-[#3e3e3c]">{item.description}</span>
                                            <span className="mt-3 block text-xs font-medium text-[#036635]">
                                                {item.articles.length} articles
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
