import './LuckySpin.css';
import { useState } from 'react';

// Wheel medal numbers 1–8 (matches segment labels on the wheel)
const PRIZES = [
    { prizeIndex: 1, amount: 3888, label: '₹3,888', img: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c95f2f60.png' },
    { prizeIndex: 2, amount: 888, label: '₹888', img: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c960d172.png' },
    { prizeIndex: 3, amount: 688, label: '₹688', img: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c961c896.png' },
    { prizeIndex: 4, amount: 188, label: '₹188', img: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c962fd78.png' },
    { prizeIndex: 5, amount: 88, label: '₹88', img: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c9647657.png' },
    { prizeIndex: 6, amount: 68, label: '₹68', img: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c9654f3c.png' },
    { prizeIndex: 7, amount: 28, label: '₹28', img: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c966252e.png' },
    { prizeIndex: 8, amount: 10, label: '₹10', img: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c96770b9.png' },
];

const WINNERS = [
    { date: '2026-07-21', name: 'sha***', prize: '10.00' },
    { date: '2026-07-21', name: 'sof***', prize: '10.00' },
    { date: '2026-07-21', name: 'seret*****', prize: '28.00' },
    { date: '2026-07-21', name: 'tmg12k******', prize: '10.00' },
    { date: '2026-07-21', name: 'bac***', prize: '10.00' },
    { date: '2026-07-21', name: 'mdas****', prize: '10.00' },
    { date: '2026-07-21', name: 'kmra****', prize: '68.00' },
    { date: '2026-07-21', name: 'mdakas******', prize: '10.00' },
    { date: '2026-07-21', name: 'sori****', prize: '10.00' },
    { date: '2026-07-21', name: 'kmra****', prize: '10.00' },
];

const SECTION_COUNT = PRIZES.length;
const SECTION_ANGLE = 360 / SECTION_COUNT;
const SPIN_DURATION_MS = 5000;

const LuckySpin = () => {
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [wonPrize, setWonPrize] = useState(null);
    const [showPopup, setShowPopup] = useState(false);

    const handleSpin = () => {
        if (spinning) return;

        setSpinning(true);
        setShowPopup(false);

        // 0–7 array index; prizeIndex on wheel is index + 1 (3 → ₹688)
        const index = Math.floor(Math.random() * SECTION_COUNT);
        const prize = PRIZES[index];

        // Land exactly on this segment relative to current rotation (fixes mismatch on 2nd+ spins)
        const targetMod = (360 - index * SECTION_ANGLE) % 360;
        const currentMod = ((rotation % 360) + 360) % 360;
        const delta = (targetMod - currentMod + 360) % 360;
        const finalRotation = rotation + 360 * 8 + delta;

        setRotation(finalRotation);

        setTimeout(() => {
            setSpinning(false);
            setWonPrize(prize);
            setShowPopup(true);
            console.log('Prize Index :', prize.prizeIndex, 'Amount :', prize.label);
        }, SPIN_DURATION_MS);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div className="rouletteMain">
            {showPopup && wonPrize && (
                <div className="luckySpin_popup_overlay" onClick={closePopup}>
                    <div
                        className="luckySpin_popup"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="You won"
                    >
                        <div className="luckySpin_popup_rays" aria-hidden="true" />
                        <div className="luckySpin_popup_sparkles" aria-hidden="true">
                            <span /><span /><span /><span /><span /><span />
                        </div>
                        <button
                            type="button"
                            className="luckySpin_popup_close"
                            onClick={closePopup}
                            aria-label="Close"
                        >
                            ×
                        </button>
                        <div className="luckySpin_popup_badge">
                            <span className="luckySpin_popup_badge_num">{wonPrize.prizeIndex}</span>
                        </div>
                        <p className="luckySpin_popup_eyebrow">Lucky Spin</p>
                        <p className="luckySpin_popup_title">You Won!</p>
                        <div className="luckySpin_popup_prize_wrap">
                            <p className="luckySpin_popup_prize">{wonPrize.label}</p>
                        </div>
                        <p className="luckySpin_popup_meta">Added to your balance</p>
                        <button type="button" className="luckySpin_popup_btn" onClick={closePopup}>
                            Collect Reward
                        </button>
                    </div>
                </div>
            )}

            <div className="rouletteMain_wrap">
                <div className="rouletteMain_body lg:mt-10 xl:mt-15">
                    {/* Awards — left on desktop, below wheel on mobile/tablet */}
                    <ul className="rouletteMain_awards">
                        {PRIZES.map((prize) => (
                            <li key={prize.prizeIndex} className="rouletteMain_awards_item">
                                <div>
                                    <div className="rouletteMain_awards_medals">{prize.prizeIndex}</div>
                                    <div className="rouletteMain_awards_prize">
                                        <img src={prize.img} alt="" />
                                    </div>
                                    <div className="rouletteMain_awards_text">{prize.label}</div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="roulette-period">2024-03-21 - 2032-01-31</div>

                    {/* Spin wheel */}
                    <div className="rouletteMain_box">
                        <div className="roulette_main_numberTimes_left">
                            <span className="font-bold text-[20px]">30</span>
                            <span>coins</span>
                            <br />
                            /swing
                        </div>

                        <div className="rouletteMain_box_wrap rouletteMain_P8_N8 luckyfortune">
                            <ul
                                className="rouletteMain_box_part rouletteMain_box_part-8 luckyfortune"
                                style={{
                                    transform: `rotate(${rotation}deg)`,
                                    transition: spinning
                                        ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.17,0.67,0.12,0.99)`
                                        : 'none',
                                }}
                            >
                                {PRIZES.map((prize) => (
                                    <li key={prize.prizeIndex} className="rouletteMain_box_part_list">
                                        <div className="rouletteMain_box_part_color" />
                                        <span className="rouletteMain_box_part_award">{prize.label}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rouletteMain_box_coin">
                            <span className="rouletteMain_box_coinWrap">
                                <img src="https://jiliwin.9terawolf.com/images/wof/1.png" className="rouletteMain_box_coin_1" alt="" />
                            </span>
                            <span className="rouletteMain_box_coinWrap">
                                <img src="https://jiliwin.9terawolf.com/images/wof/2.png" className="rouletteMain_box_coin_2" alt="" />
                            </span>
                            <span className="rouletteMain_box_coinWrap">
                                <img src="https://jiliwin.9terawolf.com/images/wof/3.png" className="rouletteMain_box_coin_3" alt="" />
                            </span>
                            <span className="rouletteMain_box_coinWrap">
                                <img src="https://jiliwin.9terawolf.com/images/wof/4.png" className="rouletteMain_box_coin_4" alt="" />
                            </span>
                            <span className="rouletteMain_box_coinWrap">
                                <img src="https://jiliwin.9terawolf.com/images/wof/5.png" className="rouletteMain_box_coin_5" alt="" />
                            </span>
                            <span className="rouletteMain_box_coinWrap">
                                <img src="https://jiliwin.9terawolf.com/images/wof/6.png" className="rouletteMain_box_coin_6" alt="" />
                            </span>
                        </div>

                        <div className="rouletteMain_box_btn" onClick={handleSpin} />
                        <div className="rouletteMain_box_numberTimes">
                            <div>
                                <div>
                                    <span>190</span>
                                    <span>coins</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Winners — right on desktop, below awards on mobile/tablet */}
                    <div className="rouletteMain_winner">
                        <div className="rouletteMain_winner_wrap">
                            <div className="rouletteMain_winner_head winnerList">
                                <div className="rouletteMain_winner_head_item">Winner's List</div>
                                {/* <div className="rouletteMain_winner_head_item">Winning Record</div> */}
                                <div className="rouletteMain_winner_head_cursor leftMost" />
                            </div>
                            <div className="rouletteMain_winner_slider">
                                <ul className="rouletteMain_winner_list">
                                    {WINNERS.map((winner, i) => (
                                        <li key={`${winner.name}-${i}`} className="rouletteMain_winner_item">
                                            <span className="rouletteMain_winner_date">{winner.date}</span>
                                            <span>{winner.name}</span>
                                            <span className="rouletteMain_winner_prize">{winner.prize}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LuckySpin;
