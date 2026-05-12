export interface DailyQuote {
  ko: string;
  en: string;
  ja: string;
  author: string;
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

export const QUOTES: DailyQuote[] = [
  {
    ko: '지출 후 남은 돈을 저축하지 말고, 저축 후 남은 돈을 써라.',
    en: 'Do not save what is left after spending; spend what is left after saving.',
    ja: '使った後に残ったお金を貯めるのではなく、貯めた後に残ったお金を使え。',
    author: 'Warren Buffett',
  },
  {
    ko: '복리는 세계 8번째 불가사의다.',
    en: 'Compound interest is the eighth wonder of the world.',
    ja: '複利は世界の第8の不思議である。',
    author: 'Albert Einstein',
  },
  {
    ko: '작은 구멍을 조심하라. 작은 구멍이 큰 배를 침몰시킨다.',
    en: 'Beware of small expenses; a small leak will sink a great ship.',
    ja: '小さな出費に気をつけよ。小さな穴が大きな船を沈める。',
    author: 'Benjamin Franklin',
  },
  {
    ko: '지식에 대한 투자가 최고의 이자를 가져다준다.',
    en: 'An investment in knowledge pays the best interest.',
    ja: '知識への投資が最大の利益をもたらす。',
    author: 'Benjamin Franklin',
  },
  {
    ko: '예산이란 돈에게 어디로 가라고 지시하는 것이다.',
    en: 'A budget is telling your money where to go instead of wondering where it went.',
    ja: '予算とは、お金がどこに行ったか不思議に思うのではなく、お金にどこへ行けと指示することだ。',
    author: 'Dave Ramsey',
  },
  {
    ko: '부는 많은 것을 소유하는 것이 아니라, 원하는 것이 적은 것이다.',
    en: 'Wealth consists not in having great possessions, but in having few wants.',
    ja: '富とは多くを持つことではなく、欲しいものが少ないことだ。',
    author: 'Epictetus',
  },
  {
    ko: '주식시장은 조급한 사람에게서 인내심 있는 사람에게로 돈을 이전하는 장치다.',
    en: 'The stock market is a device for transferring money from the impatient to the patient.',
    ja: '株式市場は、せっかちな人から忍耐強い人へお金を移す装置だ。',
    author: 'Warren Buffett',
  },
  {
    ko: '가격은 당신이 지불하는 것이고, 가치는 당신이 얻는 것이다.',
    en: 'Price is what you pay. Value is what you get.',
    ja: '価格はあなたが払うもの。価値はあなたが得るもの。',
    author: 'Warren Buffett',
  },
  {
    ko: '많이 배울수록 더 많이 벌 수 있다.',
    en: 'The more you learn, the more you earn.',
    ja: '学べば学ぶほど、稼げる。',
    author: 'Warren Buffett',
  },
  {
    ko: '부자는 작은 TV와 큰 서재를 가지고, 가난한 사람은 작은 서재와 큰 TV를 가진다.',
    en: 'Rich people have small TVs and big libraries; poor people have small libraries and big TVs.',
    ja: '金持ちは小さなテレビと大きな本棚を持ち、貧しい人は小さな本棚と大きなテレビを持つ。',
    author: 'Zig Ziglar',
  },
  {
    ko: '돈이 생기기 전에 절대 쓰지 마라.',
    en: 'Never spend your money before you have it.',
    ja: 'お金が入る前に使うな。',
    author: 'Thomas Jefferson',
  },
  {
    ko: '시간은 돈보다 더 가치 있다. 돈은 되찾을 수 있지만 시간은 되찾을 수 없다.',
    en: 'Time is more valuable than money. You can get more money, but you cannot get more time.',
    ja: '時間はお金より価値がある。お金は取り戻せるが、時間は取り戻せない。',
    author: 'Jim Rohn',
  },
  {
    ko: '부자가 되는 가장 빠른 방법은 천천히 부자가 되는 것이다.',
    en: 'The fastest way to get rich is to get rich slowly.',
    ja: '金持ちになる最速の方法は、ゆっくりと金持ちになることだ。',
    author: 'Charlie Munger',
  },
  {
    ko: '돈을 버는 것보다 돈을 지키는 것이 더 어렵다.',
    en: 'It is harder to keep money than to make it.',
    ja: 'お金を稼ぐより、お金を守る方が難しい。',
    author: 'Proverb',
  },
  {
    ko: '소비는 행복을 살 수 없지만, 저축은 선택권을 살 수 있다.',
    en: 'Spending cannot buy happiness, but saving can buy choices.',
    ja: '消費は幸福を買えないが、貯蓄は選択肢を買える。',
    author: 'Unknown',
  },
  {
    ko: '재무 자유란 돈이 나를 위해 일하게 만드는 것이다.',
    en: 'Financial freedom is making money work for you.',
    ja: '財務的自由とは、お金を自分のために働かせることだ。',
    author: 'Robert Kiyosaki',
  },
  {
    ko: '충동구매를 이기는 가장 좋은 방법은 24시간을 기다리는 것이다.',
    en: 'The best way to beat impulse buying is to wait 24 hours.',
    ja: '衝動買いに打ち勝つ最良の方法は、24時間待つことだ。',
    author: 'Unknown',
  },
  {
    ko: '씀씀이를 보면 그 사람이 보인다.',
    en: 'Show me how you spend, and I will tell you who you are.',
    ja: 'お金の使い方を見れば、その人がわかる。',
    author: 'Korean Proverb',
  },
  {
    ko: '오늘의 희생이 내일의 자유다.',
    en: "Today's sacrifice is tomorrow's freedom.",
    ja: '今日の犠牲が明日の自由だ。',
    author: 'Unknown',
  },
  {
    ko: '돈은 씨앗이다. 심지 않으면 자라지 않는다.',
    en: "Money is like a seed. If you don't plant it, it won't grow.",
    ja: 'お金は種のようなもの。蒔かなければ育たない。',
    author: 'Unknown',
  },
  {
    ko: '부자들은 자산을 사고, 중산층은 부채를 사고, 가난한 사람들은 소비만 한다.',
    en: 'Rich people buy assets, the middle class buys liabilities, and poor people only consume.',
    ja: '金持ちは資産を買い、中産階級は負債を買い、貧しい人はただ消費する。',
    author: 'Robert Kiyosaki',
  },
  {
    ko: '지출을 줄이는 것이 수입을 늘리는 것만큼 효과적이다.',
    en: 'Reducing expenses is as effective as increasing income.',
    ja: '支出を減らすことは、収入を増やすことと同じくらい効果的だ。',
    author: 'Unknown',
  },
  {
    ko: '모든 큰 재산은 조금씩 시작된다.',
    en: 'Every large fortune begins a little at a time.',
    ja: 'すべての大きな財産は少しずつから始まる。',
    author: 'Proverb',
  },
  {
    ko: '인내는 투자의 어머니다.',
    en: 'Patience is the mother of investing.',
    ja: '忍耐は投資の母だ。',
    author: 'Unknown',
  },
  {
    ko: '목표 없는 저축은 방향 없는 항해와 같다.',
    en: 'Saving without a goal is like sailing without a direction.',
    ja: '目標のない貯蓄は方向のない航海のようだ。',
    author: 'Unknown',
  },
  {
    ko: '부자가 되는 것은 행운이 아니라 습관이다.',
    en: 'Getting rich is not luck; it is a habit.',
    ja: '金持ちになるのは運ではなく、習慣だ。',
    author: 'Unknown',
  },
  {
    ko: '가장 위험한 투자는 아무것도 투자하지 않는 것이다.',
    en: 'The most dangerous investment is investing in nothing.',
    ja: '最も危険な投資は何も投資しないことだ。',
    author: 'Unknown',
  },
  {
    ko: '돈의 노예가 되지 말고, 돈의 주인이 되어라.',
    en: "Don't be a slave to money; be its master.",
    ja: 'お金の奴隷になるな。お金の主人になれ。',
    author: 'Unknown',
  },
  {
    ko: '지금 필요하지 않은 것을 사면, 필요한 것을 팔게 될 것이다.',
    en: "Buy what you don't need and you'll soon sell what you need.",
    ja: '必要でないものを買えば、やがて必要なものを売ることになる。',
    author: 'Benjamin Franklin',
  },
  {
    ko: '가족을 위한 최고의 투자는 그들과 함께하는 시간이다.',
    en: 'The best investment for your family is time spent together.',
    ja: '家族への最高の投資は、一緒に過ごす時間だ。',
    author: 'Unknown',
  },
  {
    ko: '오늘 가계부를 쓰는 것이 내일의 풍요를 만든다.',
    en: 'Keeping a ledger today creates abundance tomorrow.',
    ja: '今日家計簿をつけることが、明日の豊かさを作る。',
    author: 'Unknown',
  },
  {
    ko: '저축하는 습관 자체가 교육이다.',
    en: 'The habit of saving is itself an education.',
    ja: '貯蓄の習慣そのものが教育だ。',
    author: 'T.T. Munger',
  },
  {
    ko: '한 푼을 아끼면 한 푼을 버는 것이다.',
    en: 'A penny saved is a penny earned.',
    ja: '一円を笑う者は一円に泣く。',
    author: 'Benjamin Franklin',
  },
  {
    ko: '성공한 사람들은 어제 심은 나무의 그늘 아래 앉아 있다.',
    en: 'Successful people sit in the shade of trees they planted yesterday.',
    ja: '成功した人々は昨日植えた木の木陰に座っている。',
    author: 'Proverb',
  },
  {
    ko: '네 번의 가장 비싼 영어 단어는 "이번엔 다를 거야"다.',
    en: "The four most expensive words are 'This time it's different.'",
    ja: '最も高くつく言葉は「今回は違う」だ。',
    author: 'Sir John Templeton',
  },
  {
    ko: '당신이 소유한 것을 알고, 왜 소유하는지 알아라.',
    en: 'Know what you own, and know why you own it.',
    ja: '自分が何を持っているか、なぜ持っているかを知れ。',
    author: 'Peter Lynch',
  },
  {
    ko: '재정 계획은 미래를 예측하는 것이 아니라, 미래에 준비하는 것이다.',
    en: 'Financial planning is not about predicting the future; it is about preparing for it.',
    ja: '財務計画は未来を予測することではなく、未来に備えることだ。',
    author: 'Unknown',
  },
  {
    ko: '작은 돈을 소중히 여기지 않는 사람은 큰 돈을 만질 자격이 없다.',
    en: 'Those who do not value small money do not deserve big money.',
    ja: '小さなお金を大切にしない人は、大きなお金に値しない。',
    author: 'Korean Proverb',
  },
  {
    ko: '돈을 버는 것과 돈을 다루는 것은 다른 기술이다.',
    en: 'Earning money and managing money are different skills.',
    ja: 'お金を稼ぐことと、お金を管理することは別のスキルだ。',
    author: 'Unknown',
  },
  {
    ko: '좋은 재무 습관은 좋은 삶의 습관에서 온다.',
    en: 'Good financial habits come from good life habits.',
    ja: '良い財務習慣は良い生活習慣から来る。',
    author: 'Unknown',
  },
  {
    ko: '투자에서 편안한 것은 거의 수익성이 없다.',
    en: 'In investing, what is comfortable is rarely profitable.',
    ja: '投資において、快適なものはほとんど利益をもたらさない。',
    author: 'Robert Arnott',
  },
  {
    ko: '현명한 투자자는 시장이 떨어질 때 기뻐한다.',
    en: 'A wise investor is happy when the market falls.',
    ja: '賢明な投資家は市場が下がったとき喜ぶ。',
    author: 'Warren Buffett',
  },
  {
    ko: '돈이 일하게 하라, 당신이 잠자는 동안에도.',
    en: 'Make money work for you, even while you sleep.',
    ja: 'あなたが眠っている間もお金を働かせろ。',
    author: 'Robert Kiyosaki',
  },
  {
    ko: '저축은 지출하지 않는 것이 아니라, 미래를 위해 투자하는 것이다.',
    en: 'Saving is not about not spending; it is about investing in your future.',
    ja: '貯蓄は使わないことではなく、未来への投資だ。',
    author: 'Unknown',
  },
  {
    ko: '당신의 지출은 당신의 가치관을 보여준다.',
    en: 'Your spending reflects your values.',
    ja: 'あなたの支出はあなたの価値観を映す。',
    author: 'Unknown',
  },
  {
    ko: '남의 눈을 의식해서 산 물건이 가장 비싸다.',
    en: 'Things bought to impress others are the most expensive.',
    ja: '他人の目を気にして買ったものが最も高くつく。',
    author: 'Unknown',
  },
  {
    ko: '가장 비싼 취미는 싼 것을 사는 것이다.',
    en: 'The most expensive hobby is buying cheap things.',
    ja: '最も高くつく趣味は、安いものを買うことだ。',
    author: 'Proverb',
  },
  {
    ko: '천 리 길도 한 걸음부터.',
    en: 'A journey of a thousand miles begins with a single step.',
    ja: '千里の道も一歩から。',
    author: 'Lao Tzu',
  },
  {
    ko: '기회는 준비된 자에게 찾아온다.',
    en: 'Opportunity comes to those who are prepared.',
    ja: 'チャンスは準備できた人のところにやってくる。',
    author: 'Louis Pasteur',
  },
  {
    ko: '오늘의 편안함이 내일의 불편함을 만든다.',
    en: "Today's comfort creates tomorrow's discomfort.",
    ja: '今日の快適さが明日の不快さを作る。',
    author: 'Unknown',
  },
  {
    ko: '재정적으로 자유로워지려면 먼저 생각이 자유로워야 한다.',
    en: 'To be financially free, you must first free your mind.',
    ja: '財務的に自由になるには、まず思考を自由にしなければならない。',
    author: 'Robert Kiyosaki',
  },
  {
    ko: '부자는 기회가 왔을 때 투자할 준비가 된 사람이다.',
    en: 'Rich people are those prepared to invest when opportunity comes.',
    ja: '金持ちとは、チャンスが来たときに投資する準備ができている人だ。',
    author: 'Unknown',
  },
  {
    ko: '수입의 10%는 항상 미래의 나에게 먼저 지불하라.',
    en: 'Always pay yourself first — at least 10% of your income.',
    ja: '収入の10%は常に未来の自分に先に支払え。',
    author: 'George S. Clason',
  },
  {
    ko: '공식 교육은 당신을 먹고살게 하지만, 자기 교육은 당신을 부자로 만든다.',
    en: 'Formal education will make you a living; self-education will make you a fortune.',
    ja: '正規教育はあなたを食わせてくれるが、自己教育はあなたを豊かにする。',
    author: 'Jim Rohn',
  },
  {
    ko: '당신이 어디에 있는지, 어디로 가고 싶은지 안다면 재정 계획은 어렵지 않다.',
    en: 'If you know where you are and where you want to go, financial planning is not so hard.',
    ja: '今の位置と目的地を知っていれば、財務計画はそれほど難しくない。',
    author: 'Unknown',
  },
  {
    ko: '저축의 비밀은 단순하다: 버는 것보다 적게 써라.',
    en: 'The secret of saving is simple: spend less than you earn.',
    ja: '貯蓄の秘訣はシンプルだ：稼ぐより少なく使え。',
    author: 'Unknown',
  },
  {
    ko: '돈은 도구다. 올바르게 사용하면 아름다운 것을 만들고, 잘못 사용하면 엉망을 만든다.',
    en: 'Money is a tool. Used properly it makes something beautiful; used wrong, it makes a mess.',
    ja: 'お金は道具だ。正しく使えば美しいものを作り、間違えれば混乱を生む。',
    author: 'Bradley Vinson',
  },
  {
    ko: '부는 얼마나 많은 돈을 갖느냐가 아니라, 얼마나 많은 선택권을 갖느냐다.',
    en: 'Wealth is not about having a lot of money; it is about having a lot of options.',
    ja: '富とは多くのお金を持つことではなく、多くの選択肢を持つことだ。',
    author: 'Chris Rock',
  },
  {
    ko: '목표는 더 많은 돈이 아니다. 목표는 내 방식대로 사는 것이다.',
    en: "The goal isn't more money. The goal is living life on your terms.",
    ja: '目標はより多くのお金ではない。目標は自分の条件で生きることだ。',
    author: 'Chris Hogan',
  },
  {
    ko: '미래를 내다보는 최선의 방법은 그 미래를 직접 만드는 것이다.',
    en: 'The best way to predict the future is to create it.',
    ja: '未来を予測する最善の方法は、未来を自分で作ることだ。',
    author: 'Peter Drucker',
  },
  {
    ko: '돈을 통제하지 못하면 그 부족함이 당신을 영원히 통제할 것이다.',
    en: 'You must gain control over your money or the lack of it will forever control you.',
    ja: 'お金を管理できなければ、その不足が永遠にあなたを支配する。',
    author: 'Dave Ramsey',
  },
];

export function getDailyQuote(): DailyQuote {
  return QUOTES[getDayOfYear() % QUOTES.length];
}
