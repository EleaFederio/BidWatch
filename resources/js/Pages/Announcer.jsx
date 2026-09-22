import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextToSpeech from '@/lib/TextToSpeech';
import AnnouncementModal from '@/lib/time_left/AnnouncementModal';
import { getRemainingTimeUntilMSTimeStamp } from '@/lib/time_left/getRemainingTimeUntilMSTimeStamp';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Col, Container, FormControl, FormGroup, FormLabel, Row } from 'react-bootstrap';

const Announcer = ({ auth, announcements: initialAnnouncements = [] }) => {
    const [text, setText] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [announcements, setAnnouncements] = useState(initialAnnouncements);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const textToSpeechRef = useRef(null);
    const spokenAnnouncementIds = useRef(new Set());

    useEffect(() => {
        const intervalId = window.setInterval(() => setCurrentTime(Date.now()), 1000);

        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const timers = announcements.map((announcement) => {
            const delay = new Date(announcement.schedule).getTime() - currentTime;

            if (delay <= 0 || spokenAnnouncementIds.current.has(announcement.id)) {
                return null;
            }

            return window.setTimeout(() => {
                if (spokenAnnouncementIds.current.has(announcement.id)) {
                    return;
                }

                spokenAnnouncementIds.current.add(announcement.id);
                textToSpeechRef.current?.speak(announcement.message, async () => {
                    try {
                        await axios.patch(route('announcements.archive', announcement.id));
                        setAnnouncements((current) => current.filter((item) => item.id !== announcement.id));
                    } catch (error) {
                        console.error('Unable to archive announcement.', error);
                    }
                });
            }, delay);
        }).filter(Boolean);

        return () => timers.forEach((timerId) => window.clearTimeout(timerId));
    }, [announcements, currentTime]);

    const addScheduledAnnouncement = (createdAnnouncement) => {
        setAnnouncements((current) => [...current, createdAnnouncement]
            .sort((first, second) => new Date(first.schedule) - new Date(second.schedule)));
    };

    const announcementStats = useMemo(() => {
        const trimmed = text.trim();
        const words = trimmed ? trimmed.split(/\s+/).length : 0;
        const characters = text.length;
        const estimatedSeconds = Math.max(0, Math.ceil(words / 2.5));

        return { words, characters, estimatedSeconds };
    }, [text]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Announcer</h2>}
        >
            <Head>
                <title>Announcer</title>
            </Head>

            <Container fluid className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="site-panel overflow-hidden rounded-[28px]">
                    <div className="border-b border-[#cacaca]/60 px-6 py-6 sm:px-8">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#575757]">
                                    Public Address
                                </p>
                                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#002347]">
                                    Build, preview, and schedule announcements
                                </h1>
                                <p className="mt-3 text-sm leading-6 text-[#575757]">
                                    Draft spoken announcements, test them with text-to-speech, and prepare scheduled messages for later playback from one streamlined workspace.
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-2xl border border-[#cacaca]/70 bg-white px-4 py-3 shadow-sm">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#575757]">Words</p>
                                    <p className="mt-2 text-2xl font-semibold text-[#002347]">{announcementStats.words}</p>
                                </div>
                                <div className="rounded-2xl border border-[#cacaca]/70 bg-white px-4 py-3 shadow-sm">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#575757]">Characters</p>
                                    <p className="mt-2 text-2xl font-semibold text-[#003366]">{announcementStats.characters}</p>
                                </div>
                                <div className="rounded-2xl border border-[#cacaca]/70 bg-white px-4 py-3 shadow-sm">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#575757]">Est. Duration</p>
                                    <p className="mt-2 text-2xl font-semibold text-[#fd7702]">{announcementStats.estimatedSeconds}s</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-6 sm:px-8">
                        <Row className="g-4">
                            <Col xl={7}>
                                <Card className="h-100 overflow-hidden rounded-[24px] border-0 shadow-sm">
                                    <div className="h-1.5 bg-gradient-to-r from-[#002347] via-[#003366] to-[#003f7d]" />
                                    <Card.Body className="p-4 p-sm-5">
                                        <div className="mb-4 flex flex-col gap-3 border-bottom border-[#cacaca]/60 pb-3">
                                            <div>
                                                <h3 className="mb-1 text-xl font-semibold text-[#002347]">Create Announcement</h3>
                                                <p className="mb-0 text-sm text-[#575757]">
                                                    Type the message below, then preview it using the available speech controls.
                                                </p>
                                            </div>
                                        </div>

                                        <FormGroup>
                                            <FormLabel className="text-sm font-semibold text-[#323232]">Announcement Script</FormLabel>
                                            <FormControl
                                                as="textarea"
                                                rows={12}
                                                value={text}
                                                onChange={(event) => setText(event.target.value)}
                                                placeholder="Type the announcement you want to broadcast..."
                                                className="rounded-4 border-[#cacaca] bg-[#f6f6f4] p-3 text-sm shadow-none focus:border-[#003f7d] focus:ring-0"
                                            />
                                            <div className="mt-3 rounded-4 bg-[#f6f6f4] px-3 py-2 text-xs text-[#575757]">
                                                Keep the message concise and clear for easier playback and listener comprehension.
                                            </div>
                                        </FormGroup>
                                    </Card.Body>
                                    <Card.Footer className="border-top border-[#cacaca]/60 bg-white px-4 py-4 p-sm-5">
                                        <TextToSpeech ref={textToSpeechRef} text={text} />
                                    </Card.Footer>
                                </Card>
                            </Col>

                            <Col xl={5}>
                                <Card className="h-100 overflow-hidden rounded-[24px] border-0 shadow-sm">
                                    <div className="h-1.5 bg-gradient-to-r from-[#ff5003] via-[#fd7702] to-[#ff8e00]" />
                                    <Card.Body className="d-flex h-100 flex-column p-4 p-sm-5">
                                        <div className="mb-4 flex items-start justify-between gap-3 border-bottom border-[#cacaca]/60 pb-3">
                                            <div>
                                                <h3 className="mb-1 text-xl font-semibold text-[#002347]">Scheduled Announcements</h3>
                                                <p className="mb-0 text-sm text-[#575757]">
                                                    Prepare timed announcements for later playback.
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(true)}
                                                className="inline-flex items-center rounded-full bg-[#fd7702] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff8e00]"
                                            >
                                                Create Schedule
                                            </button>
                                        </div>

                                        <div className="flex-1 rounded-[22px] border border-dashed border-[#909090] bg-[#f6f6f4] p-4">
                                            {announcements.length > 0 ? (
                                                <div className="flex flex-column gap-3">
                                                    {announcements.map((announcement) => {
                                                        const remaining = getRemainingTimeUntilMSTimeStamp(announcement.schedule);

                                                        return (
                                                            <article key={announcement.id} className="rounded-[18px] bg-white p-4 shadow-sm">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <h4 className="mb-1 truncate text-base font-semibold text-[#002347]">{announcement.title}</h4>
                                                                    </div>
                                                                    <span className="shrink-0 rounded-full bg-[#ff8e00]/15 px-3 py-1 text-xs font-semibold text-[#c95400]">
                                                                        {remaining.days}d {remaining.hours}h {remaining.minutes}m {remaining.seconds}s
                                                                    </span>
                                                                </div>
                                                                <details className="group mt-3">
                                                                    <summary className="cursor-pointer list-none text-sm font-semibold text-[#003f7d] marker:hidden">
                                                                        <span className="group-open:hidden">View message</span>
                                                                        <span className="hidden group-open:inline">Hide message</span>
                                                                    </summary>
                                                                    <p className="mb-0 pt-2 text-sm leading-6 text-[#575757]">
                                                                        {announcement.message}
                                                                    </p>
                                                                </details>
                                                                <p className="mb-0 mt-3 text-xs font-medium text-[#575757]">
                                                                    Scheduled for {new Date(announcement.schedule).toLocaleString()}
                                                                </p>
                                                            </article>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex h-100 flex-column items-center justify-center rounded-[18px] bg-white px-4 py-5 text-center shadow-sm">
                                                    <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#ff8e00]/15 text-[#fd7702]">
                                                        <svg viewBox="0 0 20 20" className="h-6 w-6 fill-current" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2 2a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <h4 className="text-lg font-semibold text-[#002347]">No scheduled announcements yet</h4>
                                                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#575757]">
                                                        Use the schedule button to create time-based announcement entries for events, reminders, or public notices.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>
            </Container>

            <AnnouncementModal
                showModal={showModal}
                setShowModal={setShowModal}
                onCreated={addScheduledAnnouncement}
            />
        </AuthenticatedLayout>
    );
};

export default Announcer;
