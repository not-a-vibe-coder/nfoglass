'use client'

/*
 * GoRide, adapted for glass.com.ng as the "Find us" section: the paper city is Lagos, the phone
 * books a glass measure or a delivery out of the showroom on Lagos Island, and the vehicles are
 * the company's van, truck and the measurer's bike. The splash screen and the page-level navbar
 * of the original are left out because this is a section in the middle of a page. Everything
 * else (the city plan, the lens, the fleet, hold-to-book) is the original block, re-themed.
 */

import { createContext, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type ReactNode, type Ref, type RefObject, type SVGProps, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, LazyMotion, MotionConfig, animate, domMax, m, type MotionValue, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react'
import { cn } from '@/lib/utils'
import { ArrowUpRight, BatteryFull, Bike, Check, ChevronRight, Flag, LoaderCircle, MapPin, MessageCircle, Navigation, Phone, Ruler, Share2, ShieldCheck, Signal, Star, Truck, Wifi } from 'lucide-react'

// ---------- config ----------
const THEME = {
  page: '#F6F5F0',
  panel: '#F3F2EC',
  card: '#FFFFFF',
  ink: '#0E1716',
  grey: '#5B605F',
  line: 'rgba(14, 23, 22, 0.09)',

  // glass.com.ng teal: the second headline line, the vehicles' lights, the pin and the route
  accent: '#0A9E81',
  accentSoft: '#D6F6EC',

  mapBlock: '#E6EAE4',
  mapRoad: '#FFFFFF',
  mapPark: '#CFE3CC',
  mapWater: '#B9DCE0',

  paperBlock: '#E9E8DF',
  paperWater: '#D3E6E6',
  paperPark: '#DCE6D3'
}

export interface GorideLink {
  label: string
  href: string
}

export interface GorideCta extends GorideLink {
  hover: string
}

export interface GorideCopy {
  headline: string
  phrases: string[]
  phraseEvery: number
  lede: string
  primary: GorideCta
  secondary: GorideLink
  /** A line under the buttons: the showroom address. */
  address: string
  rating: string
  ratingNote: string
  stat: { value: string; label: string }
  /** Initials avatars for the customer stack. */
  customers: { name: string; initials: string }[]
}

export interface GorideLive {
  cities: { name: string; rides: number }[]
  every: number
}

export interface GorideDriver {
  name: string
  initials: string
  rating: string
  trips: string
  plate: string
  pin: string
}

export interface GoridePayment {
  method: string
  note: string
}

export interface GorideProps {
  className?: string
  theme?: Partial< typeof THEME >
  brand?: { name: string }
  copy?: Partial< GorideCopy >
  live?: Partial< GorideLive >
  driver?: Partial< GorideDriver >
  payment?: Partial< GoridePayment >
  reducedMotion?: boolean
  id?: string
}

const EMPTY_LINK: GorideLink = { label: '', href: '#' }
const EMPTY_CTA: GorideCta = { label: '', hover: '', href: '#' }

const DEFAULT_CONTENT = {
  brand: { name: '' },
  copy: {
    headline: '',
    phrases: [],
    phraseEvery: 2.8,
    lede: '',
    primary: EMPTY_CTA,
    secondary: EMPTY_LINK,
    address: '',
    rating: '',
    ratingNote: '',
    stat: { value: '', label: '' },
    customers: []
  } as GorideCopy,
  live: { cities: [], every: 3.2 } as GorideLive,
  driver: { name: '', initials: '', rating: '', trips: '', plate: '', pin: '' } as GorideDriver,
  payment: { method: '', note: '' } as GoridePayment,
  reducedMotion: undefined as boolean | undefined
}

type GorideContent = typeof DEFAULT_CONTENT

const GorideContext = createContext< GorideContent >(DEFAULT_CONTENT)

const useGoride = () => {
  const { brand: BRAND, copy: COPY, live: LIVE, driver: DRIVER, payment: PAYMENT, reducedMotion } = useContext(GorideContext)

  return { BRAND, COPY, LIVE, DRIVER, PAYMENT, reducedMotion }
}

const useReducedMotionPref = () => {
  const { reducedMotion } = useGoride()
  const system = useMediaQuery('(prefers-reduced-motion: reduce)')

  return reducedMotion ?? system
}

/** Lagos, drawn as a plan. Positions are fractions of the panel; the showroom sits on Lagos Island. */
const CITY = {
  spacing: 46,
  spacingSmall: 38,
  spacingLarge: 58,
  angle: -12,
  avenueEvery: 4,
  centerY: 0.55,
  roads: ['Broad St', 'Marina', 'Awolowo Rd', 'Ozumba Mbadiwe', 'Ikorodu Rd', 'Herbert Macaulay', 'Adeola Odeku'],
  districts: [
    { name: 'Yaba', x: 0.55, y: 0.26 },
    { name: 'Ikoyi', x: 0.87, y: 0.2 },
    { name: 'Lagos Island', x: 0.66, y: 0.56 },
    { name: 'Victoria Island', x: 0.9, y: 0.66 },
    { name: 'Surulere', x: 0.5, y: 0.84 },
    { name: 'Lekki', x: 0.8, y: 0.93 }
  ],
  parks: [
    { x: 0.6, y: 0.4 },
    { x: 0.84, y: 0.82 },
    { x: 0.44, y: 0.62 },
    { x: 0.74, y: 0.12 }
  ]
}

const LENS = { zoom: 1.45, pinY: 0.43 }

const CARS = {
  count: 12,
  cruise: 0.9,
  dispatch: 2.4,
  minutesPerBlock: 0.45,
  nearby: 6
}

// Services in the phone, each with its own vehicles in the city; `price` scales the base fare
const RIDES = [
  { id: 'car', label: 'Van', price: 1, vehicle: 'Hiace van · A-frame rack' },
  { id: 'xl', label: 'Truck', price: 1.8, vehicle: 'Flatbed · large panes' },
  { id: 'bike', label: 'Measure', price: 0.4, vehicle: 'Site measurer' }
]

// Delivery fare in naira: a base plus a rate per block
const FARE = {
  base: 15000,
  perBlock: 1800,
  minutesPerBlock: 0.6
}

const CURRENCY = { locale: 'en-NG', code: 'NGN' }

const BOOKING = { search: 1.2, pickup: 1.8, hold: 3.5, press: 0.7 }

const EASE_OUT = [0.22, 1, 0.36, 1] as const

// ---------- use-media-query ----------
const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)

      list.addEventListener('change', onChange)

      return () => list.removeEventListener('change', onChange)
    },
    [query]
  )

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}

// ---------- motion-provider ----------
const MotionProvider = ({ children }: { children: ReactNode }) => {
  const { reducedMotion } = useGoride()

  return (
    <LazyMotion features={domMax}>
      <MotionConfig reducedMotion={reducedMotion === undefined ? 'user' : reducedMotion ? 'always' : 'never'}>
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}

// ---------- vehicles, seen from above, nose to the right ----------
const GorideBikeTop = (props: SVGProps< SVGSVGElement >) => (
  <svg viewBox='0 0 40 20' fill='none' aria-hidden {...props}>
    <rect x='3' y='7.5' width='33' height='5' rx='2.5' fill='#0E1716' />
    <path d='M31 2.5v15' stroke='#0E1716' strokeWidth='2.4' strokeLinecap='round' />
    <ellipse cx='18' cy='10' rx='6.5' ry='7.5' fill='#3A3D45' />
    <circle cx='20.5' cy='10' r='4.6' className='fill-(--gr-accent)' stroke='#0E1716' strokeOpacity='0.3' />
    <rect x='35' y='8.5' width='3' height='3' rx='1' fill='#D6F6EC' />
  </svg>
)

// The van carries an A-frame of glass panes on its roof
const GorideCarTop = (props: SVGProps< SVGSVGElement >) => (
  <svg viewBox='0 0 44 24' fill='none' aria-hidden {...props}>
    <rect x='1' y='2' width='42' height='20' rx='6' fill='#FFFFFF' stroke='#0E1716' strokeOpacity='0.2' />
    <path d='M31 5h3.5c2.6 0 4.5 2.9 4.5 7s-1.9 7-4.5 7H31c.9-2 1.4-4.5 1.4-7S31.9 7 31 5Z' fill='#0E1716' />
    <rect x='8' y='6' width='20' height='12' rx='2' fill='#F2F1EA' />
    <path d='M9 12h18' stroke='#0A9E81' strokeWidth='1.2' />
    <rect x='10' y='7.5' width='16' height='3' rx='0.6' fill='#89FAE4' fillOpacity='0.8' />
    <rect x='10' y='13.5' width='16' height='3' rx='0.6' fill='#89FAE4' fillOpacity='0.8' />
    <rect x='40' y='4.5' width='2' height='4' rx='1' className='fill-(--gr-accent)' />
    <rect x='40' y='15.5' width='2' height='4' rx='1' className='fill-(--gr-accent)' />
  </svg>
)

const GorideSuvTop = (props: SVGProps< SVGSVGElement >) => (
  <svg viewBox='0 0 50 26' fill='none' aria-hidden {...props}>
    <rect x='1' y='2' width='48' height='22' rx='4' fill='#22252B' stroke='#0E1716' strokeOpacity='0.4' />
    <path d='M37 5h4c2.8 0 5 3.6 5 8s-2.2 8-5 8h-4c1-2.3 1.5-5 1.5-8S38 7.3 37 5Z' fill='#5B6270' />
    <rect x='4' y='5' width='30' height='16' rx='1.5' fill='#30343B' />
    <path d='M7 7.5v11M12 7.5v11M17 7.5v11M22 7.5v11M27 7.5v11' stroke='#89FAE4' strokeOpacity='0.55' strokeWidth='1.4' strokeLinecap='round' />
    <rect x='46' y='4.5' width='2' height='4' rx='1' className='fill-(--gr-accent)' />
    <rect x='46' y='17.5' width='2' height='4' rx='1' className='fill-(--gr-accent)' />
  </svg>
)

// ---------- city plan ----------
type GorideCityPlanProps = SVGProps< SVGSVGElement > & {
  variant: 'ink' | 'app'
  width: number
  height: number
  spacing: number
  angle: number
  center: { x: number; y: number }
  reach: number
  avenueEvery: number
  river: string
  parks: { i: number; j: number }[]
  labels?: { name: string; x: number; y: number }[]
  roads?: string[]
}

const range = (reach: number) => Array.from({ length: reach * 2 + 1 }, (_, k) => k - reach)

const tone = (i: number, j: number) => {
  const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453

  return n - Math.floor(n)
}

const GorideCityPlan = ({
  variant,
  width,
  height,
  spacing,
  angle,
  center,
  reach,
  avenueEvery,
  river,
  parks,
  labels = [],
  roads = [],
  ...props
}: GorideCityPlanProps) => {
  const id = useId()
  const app = variant === 'app'
  const far = reach * spacing
  const lines = range(reach)
  const rad = (angle * Math.PI) / 180
  const gap = spacing * (app ? 0.1 : 0.09)

  const blocks = app
    ? []
    : lines.flatMap(i =>
        lines
          .map(j => ({ i, j, shade: tone(i, j) }))
          .filter(({ i: bi, j: bj, shade }) => {
            const cx = center.x + (bi + 0.5) * spacing * Math.cos(rad) - (bj + 0.5) * spacing * Math.sin(rad)
            const cy = center.y + (bi + 0.5) * spacing * Math.sin(rad) + (bj + 0.5) * spacing * Math.cos(rad)

            return shade > 0.28 && cx > -spacing && cx < width + spacing && cy > -spacing && cy < height + spacing
          })
      )

  const avenues = lines.filter(k => k % avenueEvery === 0 && Math.abs(k) < reach - 1)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill='none' aria-hidden {...props}>
      <defs>
        <pattern id={id} width='7' height='7' patternUnits='userSpaceOnUse'>
          <circle cx='3.5' cy='3.5' r='0.9' className='fill-(--gr-ink)' fillOpacity='0.16' />
        </pattern>
      </defs>

      {app && <rect width={width} height={height} className='fill-(--gr-mapBlock)' />}

      <g transform={`translate(${center.x} ${center.y}) rotate(${angle})`}>
        {blocks.map(block => (
          <rect
            key={`${block.i}:${block.j}`}
            x={block.i * spacing + gap}
            y={block.j * spacing + gap}
            width={spacing - gap * 2}
            height={spacing - gap * 2}
            rx='2'
            className='fill-(--gr-paperBlock)'
            fillOpacity={0.35 + block.shade * 0.65}
          />
        ))}

        {parks.map(park => (
          <g key={`${park.i}:${park.j}`}>
            <rect
              x={park.i * spacing + gap}
              y={park.j * spacing + gap}
              width={spacing * 2 - gap * 2}
              height={spacing - gap * 2}
              rx={app ? spacing * 0.12 : 3}
              className={app ? 'fill-(--gr-mapPark)' : 'fill-(--gr-paperPark)'}
            />
            {!app && (
              <rect
                x={park.i * spacing + gap}
                y={park.j * spacing + gap}
                width={spacing * 2 - gap * 2}
                height={spacing - gap * 2}
                rx='3'
                fill={`url(#${id})`}
              />
            )}
          </g>
        ))}
      </g>

      <path
        d={river}
        strokeWidth={spacing * 0.8}
        strokeLinecap='round'
        className={app ? 'stroke-(--gr-mapWater)' : 'stroke-(--gr-paperWater)'}
      />

      <g transform={`translate(${center.x} ${center.y}) rotate(${angle})`}>
        {lines.map(k => {
          const avenue = k % avenueEvery === 0
          const stroke = app ? (avenue ? spacing * 0.32 : spacing * 0.2) : avenue ? spacing * 0.2 : 1
          const paint = app || avenue ? 'stroke-(--gr-mapRoad)' : 'stroke-(--gr-ink)'
          const opacity = app || avenue ? 1 : 0.07

          return (
            <g key={k}>
              <line x1={k * spacing} x2={k * spacing} y1={-far} y2={far} strokeWidth={stroke} className={paint} strokeOpacity={opacity} />
              <line x1={-far} x2={far} y1={k * spacing} y2={k * spacing} strokeWidth={stroke} className={paint} strokeOpacity={opacity} />
            </g>
          )
        })}

        {!app &&
          roads.length > 0 &&
          avenues.map((k, index) => (
            <g key={`road-${k}`} className='fill-(--gr-ink)' fillOpacity='0.32'>
              <text
                x={k * spacing}
                y={(index % 2 ? 1.5 : -2.5) * spacing}
                transform={`rotate(-90 ${k * spacing} ${(index % 2 ? 1.5 : -2.5) * spacing})`}
                textAnchor='middle'
                dominantBaseline='central'
                fontSize={spacing * 0.17}
                fontWeight='600'
                letterSpacing='0.18em'
              >
                {roads[index % roads.length].toUpperCase()}
              </text>
              <text
                x={(index % 2 ? -1.5 : 2.5) * spacing}
                y={k * spacing}
                textAnchor='middle'
                dominantBaseline='central'
                fontSize={spacing * 0.17}
                fontWeight='600'
                letterSpacing='0.18em'
              >
                {roads[(index + 3) % roads.length].toUpperCase()}
              </text>
            </g>
          ))}
      </g>

      {app &&
        labels.map(label => (
          <text
            key={label.name}
            x={label.x}
            y={label.y}
            textAnchor='middle'
            className='fill-(--gr-ink) font-semibold'
            fillOpacity='0.5'
            fontSize={spacing * 0.2}
            letterSpacing='0.04em'
          >
            {label.name.toUpperCase()}
          </text>
        ))}
    </svg>
  )
}

// The app's mark: the glass.com.ng logo
const GorideLogoMark = ({ className }: { className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element -- 18px mark inside an animated phone; next/image adds nothing here
  <img src='/logo-160.png' alt='' aria-hidden width={18} height={18} className={className} />
)

// ---------- route layer ----------
type GorideRouteLayerProps = SVGProps< SVGSVGElement > & {
  previewRef: Ref< SVGPathElement >
  routeRef: Ref< SVGPathElement >
  scale?: 'page' | 'lens'
}

const GorideRouteLayer = ({ previewRef, routeRef, scale = 'page', ...props }: GorideRouteLayerProps) => {
  const lens = scale === 'lens'

  return (
    <svg aria-hidden {...props}>
      <path
        ref={previewRef}
        fill='none'
        strokeWidth={lens ? 4 : 3}
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeDasharray={lens ? '1 8' : '1 9'}
        className='stroke-(--gr-ink)'
        strokeOpacity={lens ? 0.55 : 0.7}
      />
      <path ref={routeRef} fill='none' strokeWidth={lens ? 5 : 4} strokeLinecap='round' strokeLinejoin='round' className='stroke-(--gr-accent)' />
    </svg>
  )
}

// ---------- vehicle icon ----------
const VehicleIcon = ({ kind, length, className }: { kind: string; length: number; className?: string }) => {
  const classes = cn('-translate-x-1/2 -translate-y-1/2', className)

  if (kind === 'xl') return <GorideSuvTop width={length * 1.1} height={length * 0.57} className={classes} />

  if (kind === 'bike') return <GorideBikeTop width={length * 0.82} height={length * 0.41} className={classes} />

  return <GorideCarTop width={length} height={length * 0.55} className={classes} />
}

// ---------- cta button ----------
const CtaButton = ({ href, label, hoverLabel, className }: { href: string; label: string; hoverLabel: string; className?: string }) => (
  <a href={href} className={cn('gr-cta gr-focus group', className)}>
    <span aria-hidden className='gr-cta-fill' />
    <span className='gr-cta-labels relative grid overflow-hidden'>
      <span className='gr-cta-label gr-cta-label-rest'>{label}</span>
      <span aria-hidden className='gr-cta-label gr-cta-label-hover'>
        {hoverLabel}
      </span>
    </span>
    <span aria-hidden className='gr-cta-tile'>
      <ArrowUpRight className='gr-cta-arrow' strokeWidth={2.4} />
    </span>
  </a>
)

// ---------- city fleet ----------
type NodeType = { i: number; j: number }

type PointType = { x: number; y: number }

type CarType = {
  kind: string
  from: NodeType
  to: NodeType
  t: number
  heading: number
  queue: NodeType[]
}

const createCity = (width: number, height: number, spacing: number) => {
  const angle = (CITY.angle * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const center = { x: width / 2, y: height * CITY.centerY }
  const reach = Math.ceil(Math.hypot(width, height) / spacing / 2) + 2

  const toWorld = (i: number, j: number): PointType => ({
    x: center.x + i * spacing * cos - j * spacing * sin,
    y: center.y + i * spacing * sin + j * spacing * cos
  })

  const nearestNode = (x: number, y: number): NodeType => {
    const dx = x - center.x
    const dy = y - center.y

    return { i: Math.round((dx * cos + dy * sin) / spacing), j: Math.round((-dx * sin + dy * cos) / spacing) }
  }

  const inside = (node: NodeType, margin = spacing) => {
    const p = toWorld(node.i, node.j)

    return p.x > -margin && p.x < width + margin && p.y > -margin && p.y < height + margin
  }

  const districtAt = (x: number, y: number) =>
    CITY.districts.reduce((best, item) =>
      Math.hypot(item.x * width - x, item.y * height - y) < Math.hypot(best.x * width - x, best.y * height - y)
        ? item
        : best
    ).name

  return { width, height, spacing, angle, center, reach, toWorld, nearestNode, inside, districtAt }
}

type CityType = ReturnType< typeof createCity >

const STEPS = [
  { i: 1, j: 0 },
  { i: -1, j: 0 },
  { i: 0, j: 1 },
  { i: 0, j: -1 }
]

const same = (a: NodeType, b: NodeType) => a.i === b.i && a.j === b.j

const walk = (a: NodeType, b: NodeType) => {
  const steps: NodeType[] = []
  const cursor = { ...a }

  while (cursor.i !== b.i) {
    cursor.i += Math.sign(b.i - cursor.i)
    steps.push({ ...cursor })
  }

  while (cursor.j !== b.j) {
    cursor.j += Math.sign(b.j - cursor.j)
    steps.push({ ...cursor })
  }

  return steps
}

const createFleet = (city: CityType) => {
  const cars: CarType[] = []

  const state = {
    assigned: -1,
    target: null as NodeType | null,
    left: 0,
    total: 0,
    arrived: false
  }

  const randomNode = (): NodeType => {
    for (let k = 0; k < 80; k++) {
      const node = {
        i: Math.floor(Math.random() * city.reach * 2) - city.reach,
        j: Math.floor(Math.random() * city.reach * 2) - city.reach
      }

      if (city.inside(node, -city.spacing)) return node
    }

    return { i: 0, j: 0 }
  }

  const roam = (car: CarType) => {
    const back = { i: car.from.i - car.to.i, j: car.from.j - car.to.j }

    const options = STEPS.filter(step => !(step.i === back.i && step.j === back.j))
      .map(step => ({ i: car.to.i + step.i, j: car.to.j + step.j }))
      .filter(node => city.inside(node, -city.spacing * 0.5))

    return options.length ? options[Math.floor(Math.random() * options.length)] : { ...car.from }
  }

  for (let k = 0; k < CARS.count; k++) {
    const from = randomNode()
    const step = STEPS[Math.floor(Math.random() * 4)]
    const to = { i: from.i + step.i, j: from.j + step.j }

    cars.push({ kind: RIDES[k % RIDES.length].id, from, to, t: Math.random(), heading: 0, queue: [] })
  }

  const position = (car: CarType): PointType => {
    const a = city.toWorld(car.from.i, car.from.j)
    const b = city.toWorld(car.to.i, car.to.j)

    return { x: a.x + (b.x - a.x) * car.t, y: a.y + (b.y - a.y) * car.t }
  }

  const distance = (car: CarType, node: NodeType) =>
    1 - car.t + Math.abs(node.i - car.to.i) + Math.abs(node.j - car.to.j)

  const nearest = (node: NodeType, kind?: string) => {
    let best = { index: -1, blocks: Infinity }

    cars.forEach((car, index) => {
      if (kind && car.kind !== kind) return

      const blocks = distance(car, node)

      if (blocks < best.blocks) best = { index, blocks }
    })

    return best
  }

  const countNear = (node: NodeType, blocks: number) => cars.filter(car => distance(car, node) <= blocks).length

  const dispatch = (node: NodeType, kind?: string) => {
    const { index } = nearest(node, kind)

    if (index < 0) return

    const car = cars[index]

    car.queue = walk(car.to, node)
    state.assigned = index
    state.target = node
    state.left = distance(car, node)
    state.total = state.left
    state.arrived = false
  }

  const driveTo = (node: NodeType) => {
    if (state.assigned < 0) return

    const car = cars[state.assigned]

    car.queue = walk(car.from, node)
    car.to = car.queue.shift() ?? { ...car.from }
    car.t = 0
    state.target = node
    state.arrived = same(car.from, node)
    state.left = distance(car, node)
    state.total = state.left
  }

  const finish = () => {
    if (state.assigned < 0 || !state.target) return

    const car = cars[state.assigned]

    car.from = { ...state.target }
    car.to = { ...state.target }
    car.t = 0
    car.queue = []
    state.left = 0
    state.arrived = true
  }

  const release = () => {
    if (state.assigned >= 0) cars[state.assigned].queue = []
    state.assigned = -1
    state.target = null
    state.left = 0
    state.total = 0
    state.arrived = false
  }

  const route = (): PointType[] => {
    if (state.assigned < 0 || !state.target) return []

    const car = cars[state.assigned]

    return [position(car), ...[car.to, ...car.queue].map(node => city.toWorld(node.i, node.j))]
  }

  const step = (dt: number) => {
    cars.forEach((car, index) => {
      const assigned = index === state.assigned

      if (assigned && state.arrived) return

      let move = (assigned ? CARS.dispatch : CARS.cruise) * dt

      while (move > 0) {
        const remaining = 1 - car.t

        if (move < remaining) {
          car.t += move
          move = 0
        } else {
          move -= remaining
          car.from = car.to
          car.t = 0

          const next = car.queue.shift()

          if (next) {
            car.to = next
          } else if (assigned) {
            car.to = { ...car.from }
            state.arrived = true
            move = 0
          } else {
            car.to = roam(car)
          }
        }
      }

      const a = city.toWorld(car.from.i, car.from.j)
      const b = city.toWorld(car.to.i, car.to.j)

      if (!same(car.from, car.to)) {
        const target = Math.atan2(b.y - a.y, b.x - a.x)
        const turn = Math.atan2(Math.sin(target - car.heading), Math.cos(target - car.heading))

        car.heading += turn * Math.min(1, dt * 10)
      }
    })

    if (state.assigned >= 0 && state.target) {
      state.left = state.arrived ? 0 : distance(cars[state.assigned], state.target)
    }
  }

  return { cars, state, position, nearest, countNear, dispatch, driveTo, finish, release, route, step }
}

type FleetType = ReturnType< typeof createFleet >

// ---------- phone lens ----------
type Status = 'idle' | 'finding' | 'coming' | 'arrived' | 'trip' | 'dropped'

type TripType = { name: string; fare: number; minutes: number }

type PhoneLensProps = {
  city: CityType
  river: string
  parks: { i: number; j: number }[]
  screenRef: RefObject< HTMLDivElement | null >
  mapRef: RefObject< HTMLDivElement | null >
  routeRef: RefObject< SVGPathElement | null >
  previewRef: RefObject< SVGPathElement | null >
  carRefs: RefObject< (HTMLDivElement | null)[] >
  district: string
  etas: number[]
  nearby: number
  minutes: number
  trip: TripType | null
  progress: MotionValue< number >
  status: Status
  ride: number
  onRide: (index: number) => void
  onBook: () => void
}

const ICONS = { car: Truck, xl: Truck, bike: Ruler }

const money = new Intl.NumberFormat(CURRENCY.locale, {
  style: 'currency',
  currency: CURRENCY.code,
  maximumFractionDigits: 0
})

const sheet = {
  initial: { opacity: 0, transform: 'translateY(10px)' },
  animate: { opacity: 1, transform: 'translateY(0px)' },
  exit: { opacity: 0, transform: 'translateY(-8px)' },
  transition: { duration: 0.3, ease: EASE_OUT }
}

const ACTIONS = [
  { label: 'Call', Icon: Phone },
  { label: 'Chat', Icon: MessageCircle },
  { label: 'Share', Icon: Share2 },
  { label: 'Safety', Icon: ShieldCheck }
]

const TripBar = ({ progress, kind, flag }: { progress: MotionValue< number >; kind: string; flag?: boolean }) => {
  const width = useTransform(progress, value => `${Math.min(Math.max(value, 0), 1) * 100}%`)

  return (
    <span aria-hidden className='relative mt-3 flex items-center'>
      <span className='bg-gr-accent size-2 shrink-0 rounded-full' />
      <span className='bg-gr-ink/10 relative mx-1 h-1 flex-1 rounded-full'>
        <m.span style={{ width }} className='bg-gr-accent absolute inset-y-0 left-0 rounded-full' />
        <m.span style={{ left: width }} className='absolute top-1/2'>
          <VehicleIcon kind={kind} length={18} className='block max-w-none' />
        </m.span>
      </span>
      {flag ? <Flag className='size-3 shrink-0' /> : <MapPin className='size-3 shrink-0' />}
    </span>
  )
}

const RateDriver = ({ name }: { name: string }) => {
  const [rating, setRating] = useState(0)

  return (
    <div className='gr-rate mt-auto flex w-full items-center justify-between rounded-[11px] px-3 py-2'>
      <span className='text-[11px] font-semibold'>{rating ? 'Thank you!' : `Rate ${name}`}</span>
      <span className='flex gap-0.5'>
        {Array.from({ length: 5 }, (_, index) => (
          <button
            key={index}
            type='button'
            aria-label={`${index + 1} star${index ? 's' : ''}`}
            onClick={() => setRating(index + 1)}
            className='gr-focus cursor-pointer rounded-[4px] p-0.5'
          >
            <Star
              aria-hidden
              className={cn('size-4 transition-colors', index < rating ? 'fill-gr-accent text-gr-accent' : 'text-gr-ink/25')}
            />
          </button>
        ))}
      </span>
    </div>
  )
}

const holdStill = (event: ReactPointerEvent) => event.stopPropagation()

type HoldProps = { label: string; kind: string; busy: boolean; onBook: () => void }

const HoldToBook = ({ label, kind, busy, onBook }: HoldProps) => {
  const runRef = useRef< { stop: () => void } | null >(null)
  const fill = useMotionValue(0)
  const width = useTransform(fill, value => `${value * 100}%`)
  const reveal = useTransform(fill, value => `inset(0 ${100 - value * 100}% 0 0)`)
  const shown = useTransform(fill, [0, 0.06], [0, 1])

  const handleStart = (event: ReactPointerEvent< HTMLButtonElement >) => {
    if (busy || event.button !== 0) return

    runRef.current?.stop()
    runRef.current = animate(fill, 1, {
      duration: BOOKING.press * (1 - fill.get()),
      ease: 'linear',
      onComplete: () => {
        onBook()
        fill.set(0)
      }
    })
  }

  const handleStop = () => {
    if (fill.get() >= 1) return

    runRef.current?.stop()
    runRef.current = animate(fill, 0, { duration: 0.25, ease: EASE_OUT })
  }

  const handleKey = (event: ReactKeyboardEvent< HTMLButtonElement >) => {
    if (busy || (event.key !== 'Enter' && event.key !== ' ')) return

    event.preventDefault()
    onBook()
  }

  return (
    <button
      type='button'
      disabled={busy}
      onPointerDown={handleStart}
      onPointerUp={handleStop}
      onPointerLeave={handleStop}
      onPointerCancel={handleStop}
      onKeyDown={handleKey}
      aria-label={busy ? label : `${label}. Press and hold, or press Enter`}
      className='gr-hold gr-focus relative mt-3 flex h-10 w-full cursor-pointer items-center justify-center overflow-hidden rounded-[11px] text-[13px] font-semibold select-none disabled:cursor-progress'
    >
      <m.span aria-hidden style={{ scaleX: fill }} className='bg-gr-accent absolute inset-0 origin-left' />
      <span className='relative flex items-center gap-2 text-white'>
        {busy && <LoaderCircle aria-hidden className='size-4 animate-spin' />}
        {label}
      </span>
      <m.span aria-hidden style={{ clipPath: reveal }} className='text-gr-ink absolute inset-0 flex items-center justify-center gap-2'>
        {busy && <LoaderCircle className='size-4 animate-spin' />}
        {label}
      </m.span>
      <m.span aria-hidden style={{ left: width, opacity: shown }} className='absolute top-1/2'>
        <VehicleIcon kind={kind} length={22} />
      </m.span>
    </button>
  )
}

const PhoneLens = ({
  city,
  river,
  parks,
  screenRef,
  mapRef,
  routeRef,
  previewRef,
  carRefs,
  district,
  etas,
  nearby,
  minutes,
  trip,
  progress,
  status,
  ride,
  onRide,
  onBook
}: PhoneLensProps) => {
  const { BRAND, DRIVER, PAYMENT } = useGoride()

  const plan = useMemo(
    () => (
      <GorideCityPlan
        variant='app'
        width={city.width}
        height={city.height}
        spacing={city.spacing}
        angle={CITY.angle}
        center={city.center}
        reach={city.reach}
        avenueEvery={CITY.avenueEvery}
        river={river}
        parks={parks}
        labels={CITY.districts.map(item => ({ name: item.name, x: item.x * city.width, y: item.y * city.height }))}
      />
    ),
    [city, river, parks]
  )

  const planning = status === 'idle' || status === 'finding'
  const riding = status === 'trip' || status === 'dropped'
  const firstName = DRIVER.name.split(' ')[0]

  const fareFor = (index: number) => (trip ? money.format(Math.round((trip.fare * RIDES[index].price) / 500) * 500) : null)

  const eta = etas[ride] ?? 1
  const pinChip = planning ? `${eta} min` : status === 'arrived' ? 'Here' : `${minutes} min`

  return (
    <div className='gr-phone relative'>
      <div className='gr-bezel'>
        <div ref={screenRef} className='gr-screen relative overflow-hidden'>
          <div className='absolute inset-0'>
            <div ref={mapRef} className='absolute top-0 left-0 origin-top-left will-change-transform'>
              {plan}
            </div>

            <GorideRouteLayer previewRef={previewRef} routeRef={routeRef} scale='lens' className='absolute inset-0 size-full overflow-visible' />

            {Array.from({ length: CARS.count }, (_, index) => (
              <div
                key={index}
                ref={el => {
                  carRefs.current[index] = el
                }}
                className='absolute top-0 left-0 will-change-transform'
              >
                <VehicleIcon kind={RIDES[index % RIDES.length].id} length={24} className='gr-lens-car' />
              </div>
            ))}

            {!riding && (
              <div className='absolute left-1/2' style={{ top: `${LENS.pinY * 100}%` }}>
                <span className='gr-pin-shadow absolute top-0 left-0 h-[6px] w-[16px] -translate-x-1/2 -translate-y-1/2 rounded-full' />
                <div className='absolute bottom-0 left-0 flex -translate-x-1/2 flex-col items-center'>
                  <span className='bg-gr-ink mb-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-white'>{pinChip}</span>
                  <span className='bg-gr-accent border-gr-ink grid size-[18px] place-items-center rounded-full border-[2.5px]'>
                    <span className='bg-gr-ink size-[5px] rounded-full' />
                  </span>
                  <span className='bg-gr-ink h-[10px] w-[2px] rounded-full' />
                </div>
              </div>
            )}
          </div>

          <span aria-hidden className='gr-screen-top pointer-events-none absolute inset-x-0 top-0 z-10 h-[150px]' />

          <div className='text-gr-ink pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 pt-[11px] text-[11px] font-semibold'>
            <span>9:41</span>
            <span className='flex items-center gap-1'>
              <Signal aria-hidden className='size-3' />
              <Wifi aria-hidden className='size-3' />
              <BatteryFull aria-hidden className='size-3.5' />
            </span>
          </div>
          <span className='absolute top-[8px] left-1/2 z-10 h-[20px] w-[72px] -translate-x-1/2 rounded-full bg-black' />

          <div className='absolute inset-x-3 top-[38px] z-10'>
            <div className='flex items-center justify-between px-1'>
              <span className='flex items-center gap-1.5 text-[13px] font-bold tracking-[-0.02em]'>
                <GorideLogoMark className='size-[18px]' />
                {BRAND.name}
              </span>
              <span className='gr-avatar grid size-6 place-items-center rounded-full text-[9px] font-bold'>You</span>
            </div>
            <div className='gr-search mt-2 rounded-[12px] px-3 py-2'>
              <span className='flex items-center gap-2'>
                <MapPin aria-hidden className='size-3.5 shrink-0' />
                <span className='min-w-0'>
                  <span className='text-gr-grey block text-[9.5px] leading-tight'>From the showroom</span>
                  <AnimatePresence mode='popLayout' initial={false}>
                    <m.span
                      key={district}
                      initial={{ opacity: 0, transform: 'translateY(6px)' }}
                      animate={{ opacity: 1, transform: 'translateY(0px)' }}
                      exit={{ opacity: 0, transform: 'translateY(-6px)' }}
                      transition={{ duration: 0.25, ease: EASE_OUT }}
                      className='block truncate text-[12.5px] leading-tight font-semibold'
                    >
                      {district}
                    </m.span>
                  </AnimatePresence>
                </span>
              </span>
              <span className='border-gr-line mt-1.5 flex items-center gap-2 border-t pt-1.5'>
                <Flag aria-hidden className='size-3.5 shrink-0' />
                <span className={cn('truncate text-[11.5px]', trip ? 'font-semibold' : 'text-gr-grey')}>
                  {trip ? trip.name : 'Tap the city to set your site'}
                </span>
              </span>
            </div>
          </div>

          <div onPointerDown={holdStill} className='gr-sheet absolute inset-x-0 bottom-0 z-10 flex min-h-[33%] flex-col rounded-t-[22px] px-3.5 pt-2 pb-3'>
            <span className='bg-gr-ink/15 mx-auto mb-2 block h-1 w-8 shrink-0 rounded-full' />

            <AnimatePresence mode='wait' initial={false}>
              {planning && (
                <m.div key='plan' {...sheet} className='flex min-h-0 flex-1 flex-col'>
                  <div className='flex items-baseline justify-between gap-2'>
                    <p className='truncate text-[13px] leading-tight font-semibold'>{trip ? `Deliver to ${trip.name}` : 'Choose a service'}</p>
                    <span className='text-gr-grey shrink-0 text-[10.5px]'>
                      {trip ? `${trip.minutes} min drive` : nearby > 0 ? `${nearby} nearby` : `nearest ${eta} min`}
                    </span>
                  </div>
                  <div role='radiogroup' aria-label='Service' className='mt-2 grid grid-cols-3 gap-1.5'>
                    {RIDES.map((item, index) => {
                      const Icon = ICONS[item.id as keyof typeof ICONS] ?? Truck

                      return (
                        <button
                          key={item.id}
                          type='button'
                          role='radio'
                          aria-checked={index === ride}
                          disabled={status === 'finding'}
                          onClick={() => onRide(index)}
                          className={cn(
                            'gr-focus flex cursor-pointer flex-col items-center rounded-[12px] border py-1.5 transition-colors duration-200',
                            index === ride ? 'border-gr-ink bg-gr-accent/10' : 'border-gr-line hover:border-gr-ink/30'
                          )}
                        >
                          {item.id === 'bike' ? <Bike aria-hidden className='size-4' /> : <Icon aria-hidden className='size-4' />}
                          <span className='mt-0.5 text-[11px] font-semibold'>{item.label}</span>
                          <span className='text-gr-grey text-[10px]'>{fareFor(index) ?? `${etas[index] ?? 1} min`}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div className='border-gr-line mt-2 flex items-center gap-2 border-t pt-2 text-[11px]'>
                    <span className='gr-pay-mark flex h-5 shrink-0 items-center rounded-[5px] px-1.5 text-[10px] font-bold'>₦</span>
                    <span className='text-gr-grey min-w-0 flex-1 truncate'>{PAYMENT.note}</span>
                    <ChevronRight aria-hidden className='text-gr-grey size-3.5' />
                  </div>
                  <HoldToBook
                    label={status === 'finding' ? 'Assigning a crew' : `Hold to book ${RIDES[ride].label}`}
                    kind={RIDES[ride].id}
                    busy={status === 'finding'}
                    onBook={onBook}
                  />
                </m.div>
              )}

              {(status === 'coming' || status === 'arrived') && (
                <m.div key='driver' {...sheet} className='flex min-h-0 flex-1 flex-col'>
                  <div className='flex items-center gap-2.5'>
                    <span className='gr-avatar grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-bold'>{DRIVER.initials}</span>
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-[12.5px] font-semibold'>{DRIVER.name}</span>
                      <span className='text-gr-grey flex items-center gap-1 text-[10px] whitespace-nowrap'>
                        <Star aria-hidden className='fill-gr-accent text-gr-accent size-3' />
                        {DRIVER.rating} · {DRIVER.trips}
                      </span>
                    </span>
                    <span className='text-right leading-tight'>
                      <span className='gr-plate block rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-bold tracking-[0.04em]'>{DRIVER.plate}</span>
                      <span className='text-gr-grey mt-0.5 block text-[9.5px]'>{RIDES[ride].vehicle}</span>
                    </span>
                  </div>

                  <div className='mt-2.5 flex items-end justify-between'>
                    <p className='text-[17px] leading-none font-semibold tracking-[-0.02em]'>
                      {status === 'arrived' ? 'Loaded and leaving' : `Ready in ${minutes} min`}
                    </p>
                    <span className='gr-pin-code rounded-[7px] px-2 py-1 text-[10px] font-semibold'>
                      PIN <b className='tracking-[0.12em]'>{DRIVER.pin}</b>
                    </span>
                  </div>

                  <TripBar progress={progress} kind={RIDES[ride].id} />

                  <div className='mt-auto grid grid-cols-4 gap-1.5'>
                    {ACTIONS.map(action => (
                      <span key={action.label} className='gr-action flex flex-col items-center gap-0.5 rounded-[10px] py-1.5'>
                        <action.Icon aria-hidden className={cn('size-3.5', action.label === 'Safety' && 'text-[#D9483B]')} />
                        <span className='text-[9.5px] font-medium'>{action.label}</span>
                      </span>
                    ))}
                  </div>
                </m.div>
              )}

              {status === 'trip' && (
                <m.div key='trip' {...sheet} className='flex min-h-0 flex-1 flex-col'>
                  <span className='text-gr-grey flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.06em] uppercase'>
                    <Navigation aria-hidden className='text-gr-ink size-3' />
                    On the way
                  </span>
                  <p className='mt-1.5 text-[17px] leading-none font-semibold tracking-[-0.02em]'>
                    {minutes} min to {trip?.name}
                  </p>

                  <TripBar progress={progress} kind={RIDES[ride].id} flag />
                  <div className='text-gr-grey mt-1 flex justify-between text-[9.5px]'>
                    <span>{district}</span>
                    <span>{trip?.name}</span>
                  </div>

                  <div className='border-gr-line mt-2 flex items-center gap-2 border-t pt-2 text-[11px]'>
                    <span className='gr-pay-mark flex h-5 shrink-0 items-center rounded-[5px] px-1.5 text-[10px] font-bold'>₦</span>
                    <span className='min-w-0 flex-1 truncate font-semibold'>{fareFor(ride)}</span>
                    <span className='text-gr-grey'>
                      {firstName} · {RIDES[ride].label}
                    </span>
                  </div>

                  <div className='mt-auto grid grid-cols-2 gap-1.5'>
                    {ACTIONS.slice(2).map(action => (
                      <span key={action.label} className='gr-action flex items-center justify-center gap-1.5 rounded-[10px] py-2'>
                        <action.Icon aria-hidden className={cn('size-3.5', action.label === 'Safety' && 'text-[#D9483B]')} />
                        <span className='text-[10.5px] font-semibold'>{action.label === 'Share' ? 'Share trip' : 'Safety'}</span>
                      </span>
                    ))}
                  </div>
                </m.div>
              )}

              {status === 'dropped' && (
                <m.div key='dropped' {...sheet} className='flex min-h-0 flex-1 flex-col items-center text-center'>
                  <m.span
                    initial={{ transform: 'scale(0.5)' }}
                    animate={{ transform: 'scale(1)' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                    className='bg-gr-accent grid size-9 place-items-center rounded-full'
                  >
                    <Check aria-hidden className='size-4.5' strokeWidth={3} />
                  </m.span>
                  <p className='mt-2 text-[16px] leading-tight font-semibold tracking-[-0.02em]'>Delivered to {trip?.name}</p>
                  <p className='text-gr-grey mt-0.5 text-[10.5px]'>
                    Paid {fareFor(ride)} by {PAYMENT.method} · fitted and cleaned up
                  </p>
                  <RateDriver name={firstName} />
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------- city stage ----------
type CityStageProps = { reduceMotion: boolean; start: number }

type ReadingType = { district: string; etas: number[]; nearby: number; minutes: number; blocks: number }

// The lagoon runs from the bottom middle up to the top right
const riverPath = (width: number, height: number) =>
  `M ${width * 0.36} ${height * 1.04} C ${width * 0.5} ${height * 0.74}, ${width * 0.6} ${height * 0.66}, ${width * 0.74} ${height * 0.5} S ${width * 0.93} ${height * 0.12}, ${width * 1.04} ${height * 0.02}`

const pathFrom = (points: PointType[]) =>
  points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')

const CityStage = ({ reduceMotion, start }: CityStageProps) => {
  const [city, setCity] = useState< CityType | null >(null)
  const [status, setStatus] = useState< Status >('idle')
  const [ride, setRide] = useState(0)
  const [dropoff, setDropoff] = useState< NodeType | null >(null)
  const [hover, setHover] = useState< string | null >(null)

  const [reading, setReading] = useState< ReadingType >({
    district: CITY.districts[2].name,
    etas: RIDES.map(() => 2),
    nearby: 3,
    minutes: 0,
    blocks: 0
  })

  const stageRef = useRef< HTMLDivElement >(null)
  const phoneRef = useRef< HTMLDivElement >(null)
  const screenRef = useRef< HTMLDivElement >(null)
  const mapRef = useRef< HTMLDivElement >(null)
  const routeRef = useRef< SVGPathElement >(null)
  const previewRef = useRef< SVGPathElement >(null)
  const pageRouteRef = useRef< SVGPathElement >(null)
  const pagePreviewRef = useRef< SVGPathElement >(null)
  const pageCarRef = useRef< HTMLDivElement >(null)
  const cursorRef = useRef< HTMLDivElement >(null)
  const carRefs = useRef< (HTMLDivElement | null)[] >([])
  const fleetRef = useRef< FleetType | null >(null)
  const statusRef = useRef< Status >('idle')
  const dropoffRef = useRef< NodeType | null >(null)
  const timersRef = useRef< ReturnType< typeof setTimeout >[] >([])

  const progress = useMotionValue(0)

  const river = useMemo(() => (city ? riverPath(city.width, city.height) : ''), [city])

  const parks = useMemo(
    () => (city ? CITY.parks.map(park => city.nearestNode(park.x * city.width, park.y * city.height)) : []),
    [city]
  )

  const plan = useMemo(
    () =>
      city ? (
        <GorideCityPlan
          variant='ink'
          width={city.width}
          height={city.height}
          spacing={city.spacing}
          angle={CITY.angle}
          center={city.center}
          reach={city.reach}
          avenueEvery={CITY.avenueEvery}
          river={river}
          parks={parks}
          roads={CITY.roads}
          className='absolute inset-0'
        />
      ) : null,
    [city, river, parks]
  )

  const dropPoint = city && dropoff ? city.toWorld(dropoff.i, dropoff.j) : null
  const dropName = city && dropPoint ? city.districtAt(dropPoint.x, dropPoint.y) : ''
  const showCar = status === 'coming' || status === 'arrived' || status === 'trip' || status === 'dropped'

  const trip: TripType | null = dropoff
    ? {
        name: dropName,
        fare: FARE.base + reading.blocks * FARE.perBlock,
        minutes: Math.max(1, Math.ceil(reading.blocks * FARE.minutesPerBlock))
      }
    : null

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    dropoffRef.current = dropoff
  }, [dropoff])

  useEffect(() => {
    const stage = stageRef.current

    if (!stage) return

    let size = { width: 0, height: 0 }

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect

      if (width === size.width && Math.abs(height - size.height) < 140 && statusRef.current !== 'idle') return

      size = { width, height }

      const spacing = width >= 1800 ? CITY.spacingLarge : width >= 1024 ? CITY.spacing : CITY.spacingSmall
      const next = createCity(width, height, spacing)

      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      fleetRef.current = createFleet(next)
      setCity(next)
      setStatus('idle')
      setDropoff(null)
    })

    observer.observe(stage)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const timers = timersRef.current

    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const stage = stageRef.current

    if (!city || !stage) return

    let frame = 0
    let onScreen = true
    let last = performance.now()
    let lastReading = ''

    const box = { width: 0, height: 0, left: 0, top: 0 }

    const measure = () => {
      const phone = phoneRef.current
      const screen = screenRef.current

      if (!phone || !screen) return

      box.width = screen.offsetWidth
      box.height = screen.offsetHeight
      box.left = phone.offsetLeft + screen.offsetLeft
      box.top = phone.offsetTop + screen.offsetTop
    }

    measure()

    const section = stage.parentElement
    const layoutObserver = new ResizeObserver(measure)
    const styleObserver = new MutationObserver(measure)

    layoutObserver.observe(stage)
    if (phoneRef.current) layoutObserver.observe(phoneRef.current)
    if (screenRef.current) layoutObserver.observe(screenRef.current)

    if (section) styleObserver.observe(section, { attributes: true, attributeFilter: ['style'] })
    window.addEventListener('resize', measure)
    document.fonts?.ready.then(measure)

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      const fleet = fleetRef.current

      last = now

      if (fleet && box.width) {
        if (!reduceMotion) fleet.step(dt)
        else if (fleet.state.assigned >= 0 && !fleet.state.arrived) fleet.finish()

        const pin = { x: box.width / 2, y: box.height * LENS.pinY }
        const assigned = fleet.state.assigned >= 0 ? fleet.position(fleet.cars[fleet.state.assigned]) : null

        const focus = { x: box.left + pin.x, y: box.top + pin.y }

        const toScreen = (point: PointType) => ({
          x: (point.x - focus.x) * LENS.zoom + pin.x,
          y: (point.y - focus.y) * LENS.zoom + pin.y
        })

        if (mapRef.current) {
          mapRef.current.style.transform = `translate(${pin.x - focus.x * LENS.zoom}px, ${pin.y - focus.y * LENS.zoom}px) scale(${LENS.zoom})`
        }

        fleet.cars.forEach((car, index) => {
          const seen = toScreen(fleet.position(car))
          const icon = carRefs.current[index]

          if (icon) icon.style.transform = `translate(${seen.x}px, ${seen.y}px) rotate(${car.heading}rad)`
        })

        if (pageCarRef.current && assigned) {
          const car = fleet.cars[fleet.state.assigned]

          pageCarRef.current.style.transform = `translate(${assigned.x}px, ${assigned.y}px) rotate(${car.heading}rad)`
        }

        const route = fleet.route()

        progress.set(fleet.state.total > 0 ? 1 - fleet.state.left / fleet.state.total : 0)

        routeRef.current?.setAttribute('d', route.length > 1 ? pathFrom(route.map(toScreen)) : '')
        pageRouteRef.current?.setAttribute('d', route.length > 1 ? pathFrom(route) : '')

        const node = city.nearestNode(focus.x, focus.y)
        const drop = dropoffRef.current
        const planning = statusRef.current === 'idle' || statusRef.current === 'finding'

        const preview = drop && planning ? [node, ...walk(node, drop)].map(step => city.toWorld(step.i, step.j)) : []

        previewRef.current?.setAttribute('d', preview.length > 1 ? pathFrom(preview.map(toScreen)) : '')
        pagePreviewRef.current?.setAttribute('d', preview.length > 1 ? pathFrom(preview) : '')

        const next: ReadingType = {
          district: city.districtAt(focus.x, focus.y),
          etas: RIDES.map(item => Math.max(1, Math.ceil(fleet.nearest(node, item.id).blocks * CARS.minutesPerBlock))),
          nearby: fleet.countNear(node, CARS.nearby),
          minutes: Math.max(1, Math.ceil(fleet.state.left * CARS.minutesPerBlock)),
          blocks: drop ? Math.abs(drop.i - node.i) + Math.abs(drop.j - node.j) : 0
        }

        const key = `${next.district}|${next.etas.join(',')}|${next.nearby}|${next.minutes}|${next.blocks}`

        if (key !== lastReading) {
          lastReading = key
          setReading(previous => (planning ? next : { ...next, blocks: previous.blocks }))
        }

        if (fleet.state.arrived && statusRef.current === 'coming') {
          statusRef.current = 'arrived'
          setStatus('arrived')
        }

        if (fleet.state.arrived && statusRef.current === 'trip') {
          statusRef.current = 'dropped'
          setStatus('dropped')
        }
      }

      frame = requestAnimationFrame(loop)
    }

    const sync = () => {
      const run = onScreen && !document.hidden

      if (run && !frame) {
        last = performance.now()
        frame = requestAnimationFrame(loop)
      } else if (!run && frame) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })

    frame = requestAnimationFrame(loop)
    observer.observe(stage)
    document.addEventListener('visibilitychange', sync)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      layoutObserver.disconnect()
      styleObserver.disconnect()
      window.removeEventListener('resize', measure)
      document.removeEventListener('visibilitychange', sync)
    }
  }, [city, progress, reduceMotion])

  useEffect(() => {
    if (status !== 'arrived' && status !== 'dropped') return

    const timer = setTimeout(
      () => {
        const fleet = fleetRef.current

        if (status === 'arrived' && dropoffRef.current && fleet) {
          fleet.driveTo(dropoffRef.current)
          setStatus('trip')

          return
        }

        fleet?.release()
        setStatus('idle')
        setDropoff(null)
      },
      (status === 'arrived' ? BOOKING.pickup : BOOKING.hold) * 1000
    )

    return () => clearTimeout(timer)
  }, [status])

  const handleBook = () => {
    const fleet = fleetRef.current
    const phone = phoneRef.current
    const screen = screenRef.current

    if (!fleet || !phone || !screen || !city) return

    setStatus('finding')

    const focusX = phone.offsetLeft + screen.offsetLeft + screen.offsetWidth / 2
    const focusY = phone.offsetTop + screen.offsetTop + screen.offsetHeight * LENS.pinY
    const pickup = city.nearestNode(focusX, focusY)

    timersRef.current.push(
      setTimeout(() => {
        if (fleetRef.current !== fleet) return

        fleet.dispatch(pickup, RIDES[ride].id)
        setStatus('coming')
      }, BOOKING.search * 1000)
    )
  }

  const onPhone = (target: EventTarget | null) => target instanceof Element && !!target.closest('.gr-phone-spot')

  const onCopy = (stage: HTMLElement, clientX: number, clientY: number) => {
    const copy = stage.parentElement?.querySelector('.gr-copy')?.getBoundingClientRect()
    const margin = 32

    return !!copy && clientX > copy.left - margin && clientX < copy.right + margin && clientY > copy.top - margin && clientY < copy.bottom + margin
  }

  const handleTap = (event: ReactMouseEvent< HTMLDivElement >) => {
    if (!city || onPhone(event.target) || status !== 'idle') return
    if (onCopy(event.currentTarget, event.clientX, event.clientY)) return

    const box = event.currentTarget.getBoundingClientRect()

    setDropoff(city.nearestNode(event.clientX - box.left, event.clientY - box.top))
  }

  const handlePointer = (event: ReactPointerEvent< HTMLDivElement >) => {
    const tag = cursorRef.current

    if (!city || !tag) return

    const free = event.pointerType === 'mouse' && !onPhone(event.target) && status === 'idle' && !onCopy(event.currentTarget, event.clientX, event.clientY)

    const box = event.currentTarget.getBoundingClientRect()
    const px = event.clientX - box.left
    const py = event.clientY - box.top

    tag.style.transform = `translate(${px}px, ${py}px)`
    tag.style.opacity = free ? '1' : '0'
    event.currentTarget.style.cursor = free ? 'crosshair' : ''

    const name = free ? city.districtAt(px, py) : null

    if (name !== hover) setHover(name)
  }

  const handleLeave = () => {
    if (cursorRef.current) cursorRef.current.style.opacity = '0'
    setHover(null)
  }

  return (
    <div ref={stageRef} onClick={handleTap} onPointerMove={handlePointer} onPointerLeave={handleLeave} className='absolute inset-0'>
      {city && (
        <>
          <m.div
            key={start}
            aria-hidden
            initial={{ '--gr-reveal': reduceMotion ? '170%' : '0%' }}
            animate={{ '--gr-reveal': '170%' }}
            transition={{ duration: reduceMotion ? 0 : 1.8, delay: reduceMotion ? 0 : start, ease: EASE_OUT }}
            className='gr-reveal pointer-events-none absolute inset-0'
          >
            <div className='gr-plan absolute inset-0'>
              {plan}

              {CITY.districts.map(item => (
                <span
                  key={item.name}
                  style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%` }}
                  className={cn(
                    'gr-district font-gr-display absolute -translate-x-1/2 -translate-y-1/2 font-semibold whitespace-nowrap',
                    item.name === reading.district && 'gr-district-on',
                    item.name === hover && item.name !== reading.district && 'gr-district-hover'
                  )}
                >
                  {item.name}
                </span>
              ))}

              <GorideRouteLayer previewRef={pagePreviewRef} routeRef={pageRouteRef} className='absolute inset-0 size-full overflow-visible' />
            </div>
          </m.div>

          <AnimatePresence>
            {dropPoint && trip && (
              <m.div
                key={`${dropoff?.i}:${dropoff?.j}`}
                initial={{ opacity: 0, transform: 'translateY(-16px) scale(0.8)' }}
                animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
                exit={{ opacity: 0, transform: 'translateY(0px) scale(0.8)' }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                style={{ left: dropPoint.x, top: dropPoint.y }}
                className='pointer-events-none absolute z-10'
              >
                <span className='gr-flag absolute bottom-[18px] left-0 flex -translate-x-1/2 items-center gap-2 rounded-full py-1.5 pr-3.5 pl-1.5 text-[12.5px] font-semibold whitespace-nowrap'>
                  <span className='bg-gr-ink grid size-6 place-items-center rounded-full text-white'>
                    <Flag aria-hidden className='size-3' />
                  </span>
                  {trip.name}
                  <span className='text-gr-grey font-medium'>
                    {money.format(Math.round((trip.fare * RIDES[ride].price) / 500) * 500)} · {trip.minutes} min
                  </span>
                </span>
                <span className='gr-flag-stem absolute bottom-0 left-0 h-[18px] w-[2px] -translate-x-1/2' />
                <span className='bg-gr-ink absolute top-0 left-0 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full' />
              </m.div>
            )}
          </AnimatePresence>

          <div
            ref={pageCarRef}
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-0 left-0 z-10 transition-opacity duration-300 will-change-transform',
              showCar ? 'opacity-100' : 'opacity-0'
            )}
          >
            <VehicleIcon kind={RIDES[ride].id} length={26} className='gr-lens-car' />
          </div>

          <div
            ref={cursorRef}
            aria-hidden
            className={cn('pointer-events-none absolute top-0 left-0 z-10 opacity-0 transition-opacity duration-200', status !== 'idle' && 'invisible')}
          >
            <span className='gr-cursor-ring absolute top-0 left-0 size-7 -translate-x-1/2 -translate-y-1/2 rounded-full' />
            <span className='gr-cursor-tag absolute top-4 left-4 rounded-full px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap'>
              Deliver to {hover}
            </span>
          </div>

          <div ref={phoneRef} className='gr-phone-spot absolute z-20'>
            <span aria-hidden className='gr-phone-glow pointer-events-none absolute' />
            <m.div
              initial={reduceMotion ? false : { opacity: 0, transform: 'translateY(-70px) rotate(-5deg)' }}
              animate={{ opacity: 1, transform: 'translateY(0px) rotate(0deg)' }}
              transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.15 }}
              className='relative'
            >
              <PhoneLens
                city={city}
                river={river}
                parks={parks}
                screenRef={screenRef}
                mapRef={mapRef}
                routeRef={routeRef}
                previewRef={previewRef}
                carRefs={carRefs}
                district={reading.district}
                etas={reading.etas}
                nearby={reading.nearby}
                minutes={reading.minutes}
                trip={trip}
                progress={progress}
                status={status}
                ride={ride}
                onRide={setRide}
                onBook={handleBook}
              />
            </m.div>
          </div>
        </>
      )}
    </div>
  )
}

// ---------- hero copy ----------
const HIDDEN = { opacity: 0.01, transform: 'translateY(16px)' }

const rise = (delay: number, ready: boolean) => ({
  initial: HIDDEN,
  animate: ready ? { opacity: 1, transform: 'translateY(0px)' } : HIDDEN,
  transition: { duration: 0.7, delay, ease: EASE_OUT }
})

const count = new Intl.NumberFormat('en-US')

const subscribeNever = () => () => {}

const repeatWhileShown = (target: Element, every: number, first: number, run: () => void) => {
  let timer: ReturnType< typeof setTimeout > | undefined
  let onScreen = true
  let due = first
  let since = 0

  const schedule = () => {
    since = performance.now()
    timer = setTimeout(() => {
      run()
      due = every
      schedule()
    }, due)
  }

  const sync = () => {
    const go = onScreen && !document.hidden

    if (go && timer === undefined) {
      schedule()
    } else if (!go && timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
      due = Math.max(0, due - (performance.now() - since))
    }
  }

  const observer = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting
    sync()
  })

  schedule()
  observer.observe(target)
  document.addEventListener('visibilitychange', sync)

  return () => {
    clearTimeout(timer)
    observer.disconnect()
    document.removeEventListener('visibilitychange', sync)
  }
}

const Phrase = ({ text }: { text: string }) => (
  <span className='gr-phrase inline-flex flex-wrap gap-x-[0.26em]'>
    {text.split(' ').map((word, index) => (
      <m.span
        key={`${word}-${index}`}
        initial={{ opacity: 0, transform: 'translateY(0.35em)', filter: 'blur(10px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)', filter: 'blur(0px)' }}
        exit={{
          opacity: 0,
          transform: 'translateY(-0.3em)',
          filter: 'blur(10px)',
          transition: { duration: 0.4, delay: index * 0.05, ease: [0.4, 0, 1, 1] }
        }}
        transition={{ duration: 0.75, delay: 0.15 + index * 0.09, ease: EASE_OUT }}
        className='inline-block'
      >
        {word}
      </m.span>
    ))}
  </span>
)

const Ticker = ({ value }: { value: number }) => {
  const textRef = useRef< HTMLSpanElement >(null)
  const shown = useMotionValue(value)

  useMotionValueEvent(shown, 'change', latest => {
    if (textRef.current) textRef.current.textContent = count.format(Math.round(latest))
  })

  useEffect(() => {
    const run = animate(shown, value, { duration: 0.9, ease: EASE_OUT })

    return () => run.stop()
  }, [shown, value])

  return (
    <span ref={textRef} className='tabular-nums'>
      {count.format(value)}
    </span>
  )
}

const HeroCopy = ({ reduceMotion, start }: { reduceMotion: boolean; start: number }) => {
  const { COPY, LIVE } = useGoride()

  const [phrase, setPhrase] = useState(0)
  const [city, setCity] = useState(0)
  const [rides, setRides] = useState(LIVE.cities[0]?.rides ?? 0)

  const rootRef = useRef< HTMLDivElement >(null)

  const ready = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  )

  const at = (delay: number) => (reduceMotion ? 0 : start + delay)

  useEffect(() => {
    const root = rootRef.current

    if (reduceMotion || !root || COPY.phrases.length < 2) return

    return repeatWhileShown(root, COPY.phraseEvery * 1000, (start + 1.4 + COPY.phraseEvery) * 1000, () =>
      setPhrase(value => (value + 1) % COPY.phrases.length)
    )
  }, [reduceMotion, start, COPY.phraseEvery, COPY.phrases.length])

  useEffect(() => {
    const root = rootRef.current

    if (reduceMotion || !root || LIVE.cities.length < 2) return

    let tick = 0

    return repeatWhileShown(root, (LIVE.every / 3) * 1000, (LIVE.every / 3) * 1000, () => {
      tick++

      if (tick % 3 === 0) {
        const next = Math.floor(tick / 3) % LIVE.cities.length

        setCity(next)
        setRides(LIVE.cities[next].rides)
      } else {
        setRides(value => Math.max(1, value + Math.round(Math.random() * 3) - 1))
      }
    })
  }, [reduceMotion, LIVE.cities, LIVE.every])

  return (
    <div ref={rootRef} className='gr-copy pointer-events-auto relative z-10 flex flex-col items-start'>
      <m.p {...rise(at(0), ready)} className='gr-ticker flex items-center gap-2.5 rounded-[12px] py-1.5 pr-3.5 pl-1.5 text-[13px]'>
        <span className='gr-ticker-tag flex items-center gap-1.5 rounded-[8px] px-2 py-1 text-[10.5px] font-bold tracking-[0.12em]'>
          <span aria-hidden className='gr-live-dot' />
          LIVE
        </span>
        <span className='text-gr-ink/70'>
          <span className='text-gr-ink font-semibold'>
            <Ticker value={rides} />
          </span>{' '}
          <span className='hidden sm:inline'>glass deliveries on the road in </span>
          <span className='sm:hidden'>deliveries in </span>
          <span className='relative inline-grid overflow-hidden align-bottom'>
            {LIVE.cities.map(item => (
              <span key={item.name} aria-hidden className='invisible col-start-1 row-start-1 font-semibold'>
                {item.name}
              </span>
            ))}
            <AnimatePresence mode='popLayout' initial={false}>
              <m.span
                key={LIVE.cities[city]?.name}
                initial={{ transform: 'translateY(100%)', opacity: 0 }}
                animate={{ transform: 'translateY(0%)', opacity: 1 }}
                exit={{ transform: 'translateY(-100%)', opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT }}
                className='text-gr-ink col-start-1 row-start-1 inline-block font-semibold'
              >
                {LIVE.cities[city]?.name}
              </m.span>
            </AnimatePresence>
          </span>
        </span>
      </m.p>

      <h2 id='gr-title' className='gr-title font-gr-display mt-5 font-semibold'>
        <span className='block overflow-hidden pb-[0.06em]'>
          <m.span
            initial={{ transform: 'translateY(105%)' }}
            animate={{ transform: ready ? 'translateY(0%)' : 'translateY(105%)' }}
            transition={{ duration: 0.9, delay: at(0.08), ease: EASE_OUT }}
            className='block'
          >
            {COPY.headline}
          </m.span>
        </span>
        <span className='sr-only'>{COPY.phrases[0]}</span>
        <span aria-hidden className='gr-title-line text-gr-accent block min-h-[1em] pb-[0.08em]'>
          <m.span
            initial={{ transform: 'translateY(105%)' }}
            animate={{ transform: ready ? 'translateY(0%)' : 'translateY(105%)' }}
            transition={{ duration: 0.9, delay: at(0.2), ease: EASE_OUT }}
            className='block'
          >
            <AnimatePresence mode='wait' initial={false}>
              <Phrase key={COPY.phrases[phrase]} text={COPY.phrases[phrase] ?? ''} />
            </AnimatePresence>
          </m.span>
        </span>
      </h2>

      <m.p {...rise(at(0.3), ready)} className='gr-lede text-gr-ink/65 mt-5 max-w-[27rem] text-[16px] leading-[1.6] sm:text-[17px]'>
        {COPY.lede}
      </m.p>

      <m.div {...rise(at(0.42), ready)} className='mt-8 grid w-full gap-2.5 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3'>
        <CtaButton href={COPY.primary.href} label={COPY.primary.label} hoverLabel={COPY.primary.hover} />
        <a href={COPY.secondary.href} className='gr-ghost gr-focus group'>
          <Phone aria-hidden className='size-[18px]' />
          {COPY.secondary.label}
        </a>
      </m.div>

      <m.p {...rise(at(0.48), ready)} className='text-gr-ink/60 mt-3.5 flex items-center gap-1.5 pl-0.5 text-[13px]'>
        <MapPin aria-hidden className='text-gr-accent size-[14px] shrink-0' />
        {COPY.address}
      </m.p>

      <m.div {...rise(at(0.56), ready)} className='mt-6 flex items-center gap-4'>
        <span className='flex'>
          {COPY.customers.map((person, index) => (
            <span
              key={person.name}
              title={person.name}
              style={{ zIndex: COPY.customers.length - index }}
              className='gr-rider relative -ml-2.5 grid size-9 place-items-center rounded-full text-[11px] font-bold first:ml-0'
            >
              {person.initials}
            </span>
          ))}
        </span>
        <span className='leading-tight'>
          <span className='flex items-center gap-1.5'>
            <span className='flex gap-0.5'>
              {Array.from({ length: 5 }, (_, index) => (
                <m.span
                  key={index}
                  initial={{ transform: 'scale(0.4)', opacity: 0.25 }}
                  animate={ready ? { transform: 'scale(1)', opacity: 1 } : { transform: 'scale(0.4)', opacity: 0.25 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 18, delay: at(0.7 + index * 0.08) }}
                >
                  <Star aria-hidden className='fill-gr-accent text-gr-accent size-3.5' />
                </m.span>
              ))}
            </span>
            <span className='text-gr-ink text-[14px] font-bold'>{COPY.rating}</span>
          </span>
          <span className='text-gr-ink/60 text-[12.5px] whitespace-nowrap'>{COPY.ratingNote}</span>
        </span>
        <span aria-hidden className='bg-gr-ink/10 hidden h-8 w-px sm:block' />
        <span className='hidden leading-tight whitespace-nowrap sm:block'>
          <span className='text-gr-ink block text-[15px] font-bold'>{COPY.stat.value}</span>
          <span className='text-gr-ink/60 text-[12.5px]'>{COPY.stat.label}</span>
        </span>
      </m.div>
    </div>
  )
}

// ---------- section ----------
const HeroSection = () => {
  const sectionRef = useRef< HTMLElement >(null)
  const copyRef = useRef< HTMLDivElement >(null)
  const [seen, setSeen] = useState(false)

  const reduceMotion = useReducedMotionPref()

  // The city only draws itself, and the copy only rises, once the section scrolls into view
  useEffect(() => {
    const section = sectionRef.current

    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const copy = copyRef.current

    if (!section || !copy) return

    const measure = () => {
      const bottom = copy.getBoundingClientRect().bottom - section.getBoundingClientRect().top

      section.style.setProperty('--gr-copy-bottom', `${Math.round(bottom)}px`)
    }

    const observer = new ResizeObserver(measure)

    observer.observe(copy)
    observer.observe(section)
    measure()
    document.fonts?.ready.then(measure)

    return () => observer.disconnect()
  }, [seen])

  return (
    <section ref={sectionRef} aria-labelledby='gr-title' className='gr-panel bg-gr-panel relative isolate overflow-hidden'>
      {seen && <CityStage reduceMotion={reduceMotion} start={0.1} />}

      <div className='gr-frame gr-layout pointer-events-none relative'>
        <div className='gr-inset w-full'>
          <div ref={copyRef} className='gr-container'>
            {seen ? <HeroCopy reduceMotion={reduceMotion} start={0} /> : <div className='gr-copy h-[420px]' />}
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------- styles ----------
const BLOCK_CSS = `
.gr-root {
  --gr-max: 1280px;
  --gr-ease: cubic-bezier(0.22, 1, 0.36, 1);
  --gr-nav: 24px;
}
.gr-frame { padding-inline: 12px; }
.gr-inset { padding-inline: 20px; }
@media (min-width: 640px) {
  .gr-frame { padding-inline: 16px; }
  .gr-inset { padding-inline: 32px; }
}
@media (min-width: 1024px) {
  .gr-frame { padding-inline: 20px; }
  .gr-inset { padding-inline: 56px; }
}
.gr-root ::selection { background: var(--gr-accent); color: #fff; }
.gr-focus:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--gr-ink) 45%, transparent);
  outline-offset: 2px;
}

/* The panel: one screen tall from tablet up, rounded like a card in the page */
.gr-panel {
  min-height: calc(var(--gr-copy-bottom, 600px) + 40px + var(--gr-phone) * 2.07 + 36px);
  border-radius: 28px;
  border: 1px solid var(--gr-line);
}
.gr-panel::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.2 0 0 0 0 0.3 0 0 0 0 0.28 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  content: '';
  pointer-events: none;
}
.gr-layout { padding-top: calc(var(--gr-nav) + 28px); }
@media (min-width: 768px) {
  .gr-panel { height: min(100dvh, 900px); min-height: 720px; }
  .gr-layout { display: flex; height: 100%; align-items: center; padding-top: 0; }
}
@media (min-width: 1024px) {
  .gr-panel { min-height: 680px; border-radius: 40px; }
}
.gr-title {
  font-size: min(clamp(2.6rem, 1.2rem + 8vw, 5rem), calc(100cqi / 6.9));
  line-height: 0.92;
  letter-spacing: -0.04em;
}
.gr-title-line { white-space: nowrap; }
.gr-title-line .gr-phrase { flex-wrap: nowrap; }
@media (min-width: 768px) { .gr-title { font-size: min(3.6rem, calc(100cqi / 6.9)); } }
@media (min-width: 1024px) { .gr-title { font-size: min(clamp(3.6rem, 1.8rem + 4.4vw, 6.2rem), 11dvh, calc(100cqi / 6.9)); } }
.gr-container { width: 100%; max-width: var(--gr-max); margin-inline: auto; }
.gr-copy {
  container-type: inline-size;
  max-width: 540px;
  text-shadow: 0 0 18px var(--gr-panel);
}
@media (min-width: 768px) { .gr-copy { max-width: calc(100% - var(--gr-phone) - 40px); } }
@media (min-width: 1024px) { .gr-copy { max-width: min(560px, 100% - var(--gr-phone) - 64px); } }
@media (min-width: 1536px) { .gr-copy { max-width: min(640px, 100% - var(--gr-phone) - 64px); } }

@property --gr-reveal {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
.gr-reveal {
  --gr-origin: 50% 74%;
  -webkit-mask-image: radial-gradient(circle at var(--gr-origin), #000 calc(var(--gr-reveal) - 16%), transparent var(--gr-reveal));
  mask-image: radial-gradient(circle at var(--gr-origin), #000 calc(var(--gr-reveal) - 16%), transparent var(--gr-reveal));
}
.gr-plan {
  -webkit-mask-image: linear-gradient(to bottom, transparent 20%, #000 46%);
  mask-image: linear-gradient(to bottom, transparent 20%, #000 46%);
}
@media (min-width: 768px) {
  .gr-reveal { --gr-origin: 76% 50%; }
  .gr-plan {
    -webkit-mask-image: linear-gradient(100deg, rgba(0,0,0,0.12) 18%, rgba(0,0,0,0.35) 34%, #000 56%);
    mask-image: linear-gradient(100deg, rgba(0,0,0,0.12) 18%, rgba(0,0,0,0.35) 34%, #000 56%);
  }
}
.gr-district {
  color: color-mix(in srgb, var(--gr-ink) 8%, transparent);
  font-size: clamp(22px, 3vw, 52px);
  letter-spacing: -0.03em;
  transition: color 0.4s var(--gr-ease);
}
.gr-district-on { color: color-mix(in srgb, var(--gr-accent) 60%, transparent); }
.gr-district-hover { color: color-mix(in srgb, var(--gr-ink) 18%, transparent); }
.gr-flag {
  background-color: var(--gr-card);
  color: var(--gr-ink);
  box-shadow: 0 0 0 1px var(--gr-line), 0 14px 28px -16px rgba(10, 40, 34, 0.5);
}
.gr-flag-stem { background-color: var(--gr-ink); }
.gr-cursor-ring {
  border: 1.5px solid color-mix(in srgb, var(--gr-ink) 45%, transparent);
  background-color: color-mix(in srgb, var(--gr-accent) 16%, transparent);
}
.gr-cursor-tag { background-color: var(--gr-ink); color: #fff; }
.gr-phone-glow {
  inset: 8% -55%;
  background: radial-gradient(closest-side, color-mix(in srgb, var(--gr-accent) 26%, transparent), transparent);
  filter: blur(12px);
}
.gr-phone-spot {
  top: calc(var(--gr-copy-bottom, 600px) + 40px);
  left: calc(50% - var(--gr-phone) / 2);
  border-radius: calc(var(--gr-phone) * 0.165);
}
@media (min-width: 768px) {
  .gr-phone-spot { top: calc(50% - var(--gr-phone) * 1.03); left: auto; right: 40px; }
}
@media (min-width: 1024px) {
  .gr-phone-spot { right: calc((100% - min(100% - 152px, var(--gr-max))) / 2 - 10px); }
}
.gr-root { --gr-phone: min(258px, calc(100vw - 96px)); }
@media (min-width: 768px) { .gr-root { --gr-phone: clamp(236px, calc((min(100dvh, 900px) - 140px) * 0.47), 268px); } }
@media (min-width: 1024px) { .gr-root { --gr-phone: clamp(236px, calc((min(100dvh, 900px) - 110px) * 0.47), 300px); } }
.gr-phone {
  width: var(--gr-phone);
  padding: calc(var(--gr-phone) * 0.026);
  border-radius: calc(var(--gr-phone) * 0.165);
  background: linear-gradient(150deg, #c9d6d1 0%, #6f8580 22%, #26302d 52%, #93a8a2 100%);
  box-shadow: 0 60px 90px -45px rgba(10, 40, 34, 0.5), 0 22px 40px -26px rgba(10, 40, 34, 0.45);
}
.gr-bezel {
  padding: calc(var(--gr-phone) * 0.022);
  border-radius: calc(var(--gr-phone) * 0.142);
  background-color: #0d0e10;
}
.gr-screen {
  container-type: inline-size;
  aspect-ratio: 0.46;
  border-radius: calc(var(--gr-phone) * 0.12);
  background-color: var(--gr-mapBlock);
  color: var(--gr-ink);
  isolation: isolate;
}
.gr-screen-top {
  background: linear-gradient(to bottom, var(--gr-card) 34%, color-mix(in srgb, var(--gr-card) 70%, transparent) 70%, transparent);
}
.gr-lens-car { filter: drop-shadow(0 2px 3px rgba(14, 23, 22, 0.3)); }
.gr-pin-shadow { background: radial-gradient(closest-side, rgba(14, 23, 22, 0.35), transparent); }
.gr-search {
  background-color: var(--gr-card);
  box-shadow: 0 0 0 1px var(--gr-line), 0 10px 20px -14px rgba(14, 23, 22, 0.5);
}
.gr-sheet {
  background-color: var(--gr-card);
  box-shadow: 0 -12px 24px -18px rgba(14, 23, 22, 0.45);
}
.gr-hold { background-color: var(--gr-ink); touch-action: none; }
.gr-avatar {
  border: 1.5px solid var(--gr-accent);
  background-color: var(--gr-accentSoft);
  color: var(--gr-ink);
}
.gr-ticker {
  background-color: color-mix(in srgb, var(--gr-card) 80%, transparent);
  box-shadow: 0 0 0 1px var(--gr-line), 0 10px 24px -18px rgba(10, 40, 34, 0.5);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
.gr-ticker-tag { background-color: var(--gr-ink); color: #fff; }
.gr-rider {
  border: 2.5px solid var(--gr-panel);
  background-color: var(--gr-accentSoft);
  color: var(--gr-ink);
}
.gr-pay-mark { background-color: var(--gr-ink); color: #fff; }
.gr-plate {
  border: 1px solid color-mix(in srgb, var(--gr-ink) 18%, transparent);
  background-color: var(--gr-panel);
}
.gr-pin-code { background-color: var(--gr-accentSoft); color: var(--gr-ink); }
.gr-action { background-color: var(--gr-panel); color: var(--gr-ink); }
.gr-rate { background-color: var(--gr-panel); }

.gr-cta {
  position: relative;
  isolation: isolate;
  display: inline-flex;
  height: 56px;
  flex-shrink: 0;
  align-items: center;
  gap: 14px;
  overflow: hidden;
  border-radius: 14px;
  padding: 0 7px 0 22px;
  background: linear-gradient(180deg, #1f2c2a 0%, var(--gr-ink) 100%);
  color: #fff;
  font-size: 15.5px;
  font-weight: 600;
  white-space: nowrap;
  text-shadow: none;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.14), 0 1px 2px rgba(14,23,22,0.3), 0 14px 28px -14px rgba(14,23,22,0.55);
  transition: color 0.45s var(--gr-ease), box-shadow 0.3s var(--gr-ease), transform 0.15s var(--gr-ease);
}
.gr-cta:hover {
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 1px 2px rgba(14,23,22,0.2), 0 18px 32px -14px color-mix(in srgb, var(--gr-accent) 80%, transparent);
}
.gr-cta:active { transform: scale(0.97); }
.gr-cta-fill {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-color: var(--gr-accent);
  clip-path: inset(7px 7px 7px calc(100% - 49px) round 10px);
  transition: clip-path 0.55s var(--gr-ease);
}
.gr-cta:hover .gr-cta-fill { clip-path: inset(0 0 0 0 round 14px); }
.gr-cta-tile { display: grid; width: 42px; height: 42px; flex-shrink: 0; place-items: center; color: #fff; }
.gr-cta-arrow { width: 18px; height: 18px; transition: transform 0.45s var(--gr-ease); }
.gr-cta:hover .gr-cta-arrow { transform: translate(2px, -2px) rotate(45deg); }
.gr-cta-label { grid-area: 1 / 1; transition: transform 0.45s var(--gr-ease); }
.gr-cta-label-hover { transform: translateY(110%); }
.gr-cta:hover .gr-cta-label-rest { transform: translateY(-110%); }
.gr-cta:hover .gr-cta-label-hover { transform: translateY(0); }
@media (max-width: 639px) {
  .gr-copy .gr-cta { justify-content: space-between; }
  .gr-copy .gr-ghost { justify-content: center; }
}
.gr-ghost {
  display: inline-flex;
  height: 56px;
  align-items: center;
  gap: 9px;
  border-radius: 14px;
  padding: 0 20px 0 18px;
  background-color: color-mix(in srgb, var(--gr-card) 70%, transparent);
  color: var(--gr-ink);
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gr-ink) 14%, transparent);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  transition: box-shadow 0.25s var(--gr-ease), background-color 0.25s var(--gr-ease), transform 0.15s var(--gr-ease);
}
.gr-ghost:hover {
  background-color: var(--gr-card);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--gr-ink) 32%, transparent), 0 12px 24px -16px rgba(10,40,34,0.5);
}
.gr-ghost svg { transition: transform 0.35s var(--gr-ease); }
.gr-ghost:hover svg { transform: rotate(-12deg); }
.gr-ghost:active { transform: scale(0.97); }
.gr-live-dot {
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background-color: var(--gr-accent);
}
.gr-live-dot::after {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: var(--gr-accent);
  content: '';
  animation: gr-ping 1.8s var(--gr-ease) infinite;
}
@keyframes gr-ping {
  from { transform: scale(1); opacity: 0.8; }
  to { transform: scale(2.8); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .gr-cta-fill, .gr-cta-label, .gr-cta-arrow { transition: none; }
  .gr-live-dot::after { animation: none; }
}
.bg-gr-accent\\/10{background-color:color-mix(in oklab, var(--gr-accent) 10%, transparent)}
.bg-gr-accent{background-color:var(--gr-accent)}
.bg-gr-card{background-color:var(--gr-card)}
.bg-gr-ink\\/10{background-color:color-mix(in oklab, var(--gr-ink) 10%, transparent)}
.bg-gr-ink\\/15{background-color:color-mix(in oklab, var(--gr-ink) 15%, transparent)}
.bg-gr-ink{background-color:var(--gr-ink)}
.bg-gr-page{background-color:var(--gr-page)}
.bg-gr-panel{background-color:var(--gr-panel)}
.border-gr-ink{border-color:var(--gr-ink)}
.border-gr-line{border-color:var(--gr-line)}
.fill-gr-accent{fill:var(--gr-accent)}
.font-gr-display{font-family:var(--font-display-face), ui-sans-serif, system-ui, sans-serif}
.font-gr-sans{font-family:var(--font-sans-face), ui-sans-serif, system-ui, sans-serif}
.hover\\:bg-gr-ink\\/5:hover{background-color:color-mix(in oklab, var(--gr-ink) 5%, transparent)}
.hover\\:border-gr-ink\\/30:hover{border-color:color-mix(in oklab, var(--gr-ink) 30%, transparent)}
.text-gr-accent{color:var(--gr-accent)}
.text-gr-grey{color:var(--gr-grey)}
.text-gr-ink\\/25{color:color-mix(in oklab, var(--gr-ink) 25%, transparent)}
.text-gr-ink\\/60{color:color-mix(in oklab, var(--gr-ink) 60%, transparent)}
.text-gr-ink\\/65{color:color-mix(in oklab, var(--gr-ink) 65%, transparent)}
.text-gr-ink\\/70{color:color-mix(in oklab, var(--gr-ink) 70%, transparent)}
.text-gr-ink{color:var(--gr-ink)}
`

/**
 * The Lagos map section: a paper city with live delivery vans, and a phone that is a window onto
 * it. Tap the map to set your site, hold Book to send a van, a truck or a measurer.
 */
const GoRide = ({ className, theme, brand, copy, live, driver, payment, reducedMotion, id }: GorideProps) => {
  const content = useMemo< GorideContent >(
    () => ({
      brand: { ...DEFAULT_CONTENT.brand, ...brand },
      copy: { ...DEFAULT_CONTENT.copy, ...copy },
      live: { ...DEFAULT_CONTENT.live, ...live },
      driver: { ...DEFAULT_CONTENT.driver, ...driver },
      payment: { ...DEFAULT_CONTENT.payment, ...payment },
      reducedMotion
    }),
    [brand, copy, live, driver, payment, reducedMotion]
  )

  const themeCss = `.gr-root{${Object.entries({ ...THEME, ...theme })
    .map(([role, value]) => `--gr-${role}:${value};`)
    .join('')}color-scheme:light}`

  return (
    <GorideContext.Provider value={content}>
      <style>{BLOCK_CSS}</style>
      <style>{themeCss}</style>
      <MotionProvider>
        <div id={id} data-slot='goride' className={cn('gr-root font-gr-sans text-gr-ink w-full antialiased', className)}>
          <HeroSection />
        </div>
      </MotionProvider>
    </GorideContext.Provider>
  )
}

export { GoRide }
export default GoRide
