'use client';
import { useEffect, useMemo, useState } from 'react';
import { days, getDayById, ticketPlan, ticketProgress } from './itinerary.mjs';
import { heroTitle } from './branding.mjs';
import Image from 'next/image';
import heroArtwork from '../public/hero-kk.png';

export default function Home() {
  const [activeDay, setActiveDay] = useState('arrival');
  const [doneTickets, setDoneTickets] = useState<Set<string>>(new Set());
  const selected = getDayById(activeDay);
  const progress = ticketProgress(doneTickets);
  const activeIndex = useMemo(() => days.findIndex((day) => day.id === activeDay), [activeDay]);

  useEffect(() => {
    const saved = window.localStorage.getItem('xian-ticket-plan');
    if (saved) setDoneTickets(new Set(JSON.parse(saved)));
  }, []);

  const toggleTicket = (id: string) => setDoneTickets((current) => {
    const next = new Set(current);
    if (next.has(id)) next.delete(id); else next.add(id);
    window.localStorage.setItem('xian-ticket-plan', JSON.stringify([...next]));
    return next;
  });

  return <main>
    <header className="topbar">
      <a className="brand" href="#top" aria-label="返回顶部"><span>长安</span><small>亲子行记</small></a>
      <nav aria-label="页面导航"><a href="#route">每日行程</a><a href="#tickets">抢票日历</a><a href="#essentials">随身清单</a></nav>
      <div className="trip-chip">2大1小 · 6天5晚</div>
    </header>

    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow">2026.10.23 — 10.28 · 西安</p>
        <h1 aria-label={heroTitle}>和KK一起<br/>读一遍<span>长安</span></h1>
        <p className="hero-lead">从碑刻里的文字，到秦陵地下军阵；从盛唐灯火，到一口刚出炉的牛肉饼。四个完整白天，一条不赶路的历史主线。</p>
        <div className="hero-actions"><a className="primary-btn" href="#route">打开每日路线 <span>↓</span></a><a className="text-link" href="#tickets">先看抢票计划</a></div>
      </div>
      <div className="hero-card" aria-label="旅程概要">
        <div className="seal">西安</div>
        <div className="hero-card-line"><span>住</span><strong>永宁门大景城堡酒店</strong></div>
        <div className="hero-card-line"><span>行</span><strong>打车为主 · 老城步行</strong></div>
        <div className="hero-card-line"><span>看</span><strong>碑林 · 陕历博 · 秦陵</strong></div>
        <div className="hero-card-line"><span>吃</span><strong>早市 · 回坊 · 陕西家常</strong></div>
        <p>历史文化深度 × 经典景点 × 十岁友好</p>
      </div>
    </section>

    <figure className="artwork-section" aria-labelledby="artwork-caption">
      <Image src={heroArtwork} alt="和KK一起读一遍长安，西安亲子历史文化之旅" priority sizes="100vw" />
      <figcaption id="artwork-caption">KK的西安亲子历史文化之旅 · 2026.10.23—10.28</figcaption>
    </figure>

    <section className="route-section" id="route">
      <div className="section-heading"><p className="eyebrow">THE ROUTE</p><h2>六天，四个历史章节</h2><p>点击日期切换具体时间轴。</p></div>
      <div className="day-tabs" role="tablist" aria-label="选择日期">
        {days.map((day) => <button key={day.id} role="tab" aria-selected={activeDay === day.id} className={activeDay === day.id ? 'active' : ''} onClick={() => setActiveDay(day.id)}><span>{day.date}</span><small>{day.weekday}</small></button>)}
      </div>
      <article className={`day-detail tone-${selected.tone}`}>
        <div className="day-intro"><p className="day-count">DAY {activeIndex + 1}</p><p className="day-kicker">{selected.kicker}</p><h3>{selected.title}</h3><p>{selected.summary}</p><div className="day-tip"><span>给家长的提示</span>{selected.tip}</div></div>
        <ol className="timeline">{selected.items.map((item:{time:string;title:string;text:string}, index:number) => <li key={`${item.time}-${item.title}`}><span className="timeline-no">{String(index + 1).padStart(2,'0')}</span><div><time>{item.time}</time><h4>{item.title}</h4><p>{item.text}</p></div></li>)}</ol>
      </article>
    </section>

    <section className="tickets-section" id="tickets">
      <div className="section-heading light"><p className="eyebrow">TICKET PLAN</p><h2>把难抢的票，变成几个闹钟</h2><p>勾选状态会保存在当前设备。</p></div>
      <div className="ticket-progress"><span style={{width:`${progress.completed / progress.total * 100}%`}}/><p>{progress.completed}/{progress.total} 已完成</p></div>
      <div className="ticket-grid">{ticketPlan.map((ticket) => <button key={ticket.id} className={`ticket-card ${ticket.level} ${doneTickets.has(ticket.id) ? 'done' : ''}`} onClick={() => toggleTicket(ticket.id)} aria-pressed={doneTickets.has(ticket.id)}><span className="check">{doneTickets.has(ticket.id) ? '✓' : ''}</span><time>{ticket.date}</time><h3>{ticket.title}</h3><p>{ticket.detail}</p></button>)}</div>
      <div className="ticket-note"><strong>最重要：</strong>10月20日 16:40进入陕历博预约页面，17:00提交全家信息；只有出现“成功订单”才算抢到。</div>
    </section>

    <section className="essentials" id="essentials">
      <div className="section-heading"><p className="eyebrow">PACK LIGHT</p><h2>带得少，走得远</h2></div>
      <div className="essentials-grid">
        <div><span>01</span><h3>证件</h3><p>全家身份证原件；兵马俑免费儿童仍需预约并核验证件。</p></div>
        <div><span>02</span><h3>穿着</h3><p>薄内层＋防风外套＋缓震运动鞋，出发前3–5天再看天气。</p></div>
        <div><span>03</span><h3>随身</h3><p>充电宝、保温杯、小零食；城墙风大，剧场也可能偏凉。</p></div>
        <div><span>04</span><h3>节奏</h3><p>每天一个重头戏，午后留休息；孩子疲劳时果断删减。</p></div>
      </div>
    </section>
    <footer><div><span className="footer-mark">長安</span><p>文字留下历史，旅行让它重新发生。</p></div><a href="#top">回到顶部 ↑</a></footer>
  </main>;
}
