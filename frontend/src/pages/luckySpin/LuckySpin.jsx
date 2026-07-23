import './LuckySpin.css';
import { useState, useEffect } from 'react';
import axios from '../../utils/axiosConfig';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setLiveBalance } from '../../features/auth/authSlice';

const SECTION_COUNT = 8;
const SECTION_ANGLE = 360 / SECTION_COUNT;
const SPIN_DURATION_MS = 5000;

const PRIZE_IMAGES = {
    1: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c95f2f60.png',
    2: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c960d172.png',
    3: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c961c896.png',
    4: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c962fd78.png',
    5: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c9647657.png',
    6: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c9654f3c.png',
    7: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c966252e.png',
    8: 'https://jiliwin.9terawolf.com/cms/babu/image/66556c96770b9.png',
};

const generateFakeWinners = () => {
    const names = ['sha', 'sof', 'ser', 'tmg', 'bac', 'mda', 'kmr', 'sor', 'ali', 'rob', 'joh', 'mic'];
    const prizes = ['10.00', '28.00', '68.00', '88.00', '98.00', '188.00', '588.00', '888.00', '3888.00'];
    
    const fakeWinners = [];
    for (let i = 0; i < 15; i++) {
        const randomName = names[Math.floor(Math.random() * names.length)] + '***';
        const randomPrize = prizes[Math.floor(Math.random() * prizes.length)];
        
        // Random date within the last 3 days
        const d = new Date();
        d.setDate(d.getDate() - Math.floor(Math.random() * 3));
        const dateStr = d.toISOString().split('T')[0];
        
        fakeWinners.push({ date: dateStr, name: randomName, prize: randomPrize });
    }
    return fakeWinners;
};

const LuckySpin = () => {
    const dispatch = useDispatch();
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const [wonPrize, setWonPrize] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    
    const [rewards, setRewards] = useState([]);
    const [userStats, setUserStats] = useState({ coins: 0, spinsToday: 0, remainingSpins: 10 });
    const [fakeWinners, setFakeWinners] = useState([]);
    
    useEffect(() => {
        fetchInfo();
        setFakeWinners(generateFakeWinners());
        
        // Auto-refresh the rewards and coins every 10 seconds
        const interval = setInterval(() => {
            if (!spinning) {
                fetchInfo();
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [spinning]);

    const fetchInfo = async () => {
        try {
            const res = await axios.get('/lucky-spin/info');
            if (res.data.success) {
                setRewards(res.data.data.rewards);
                setUserStats(res.data.data.userStats);
            }
        } catch (error) {
            console.error('Failed to fetch lucky spin info', error);
        }
    };

    const handleSpin = async () => {
        if (spinning) return;

        try {
            setSpinning(true);
            setShowPopup(false);

            const res = await axios.post('/lucky-spin/spin');
            
            if (res.data.success) {
                const spinResult = res.data.data;
                // update local stats
                setUserStats(prev => ({ ...prev, coins: spinResult.remainingCoins, spinsToday: spinResult.spinsToday, remainingSpins: 10 - spinResult.spinsToday }));
                
                // Find matching reward to animate to
                const winningNumber = spinResult.winningNumber;
                // Array index is number - 1
                const index = winningNumber - 1;
                
                const targetMod = (360 - index * SECTION_ANGLE) % 360;
                const currentMod = ((rotation % 360) + 360) % 360;
                const delta = (targetMod - currentMod + 360) % 360;
                const finalRotation = rotation + 360 * 8 + delta;

                setRotation(finalRotation);

                setTimeout(() => {
                    setSpinning(false);
                    setWonPrize(spinResult);
                    setShowPopup(true);
                    if (spinResult.type === 'cash') {
                        dispatch(setLiveBalance(spinResult.newBalance));
                    }
                }, SPIN_DURATION_MS);
            } else {
                setSpinning(false);
                toast.error(res.data.message || 'Spin failed');
            }
        } catch (error) {
            setSpinning(false);
            toast.error(error.response?.data?.message || 'Error spinning');
        }
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
                            <span className="luckySpin_popup_badge_num">{wonPrize.winningNumber}</span>
                        </div>
                        <p className="luckySpin_popup_eyebrow">Lucky Spin</p>
                        <p className="luckySpin_popup_title">You Won!</p>
                        <div className="luckySpin_popup_prize_wrap">
                            <p className="luckySpin_popup_prize">₹{wonPrize.winGift}</p>
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
                        {rewards.map((prize) => (
                            <li key={prize.number} className="rouletteMain_awards_item">
                                <div>
                                    <div className="rouletteMain_awards_medals">{prize.number}</div>
                                    <div className="rouletteMain_awards_prize">
                                        <img src={PRIZE_IMAGES[prize.number]} alt="" />
                                    </div>
                                    <div className="rouletteMain_awards_text">₹{prize.winGift}</div>
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
                                {rewards.map((prize) => (
                                    <li key={prize.number} className="rouletteMain_box_part_list">
                                        <div className="rouletteMain_box_part_color" />
                                        <span className="rouletteMain_box_part_award">₹{prize.winGift}</span>
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
                                    <span>{userStats.coins}</span>
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
                                    {fakeWinners.map((winner, i) => (
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
