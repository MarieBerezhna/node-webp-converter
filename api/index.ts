import express, { Request, Response, NextFunction } from 'express';
// import cors from 'cors';
import session, { SessionOptions } from 'express-session';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpecs } from '../swagger';
import cron from 'node-cron';
import routes from './routes';
import inMemoryStore, { SessionData } from './session';
import { cleanInactiveSpaces, removeUserSpace } from './utils/generic';

const app = express();

const sess: SessionOptions = {
	store: inMemoryStore,
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }, // Default value; will be updated conditionally
};

// Conditionally set secure cookies based on environment
if (app.get('env') !== 'development') {
	app.set('trust proxy', 1); // Trust first proxy
	// Ensure cookie property exists before setting `secure`
	if (sess.cookie) {
		sess.cookie.secure = true; // Serve secure cookies
	}
}

app.use(session(sess));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// List of allowed origins
const allowedOrigins = ['http://localhost:8080', 'https://marieberezhna.vercel.app'];

// const corsOptions = {
// 	origin: (
// 		origin: string | undefined,
// 		callback: (err: Error | null, isAllowed?: boolean) => void
// 	) => {
// 		if (!origin || allowedOrigins.includes(origin)) {
// 			callback(null, true); // Allow the request
// 		} else {
// 			callback(new Error('Not allowed by CORS')); // Block the request
// 		}
// 	},
// 	methods: ['GET', 'POST', 'PUT', 'DELETE'],
// 	credentials: true,
// };

// app.use(cors(corsOptions));

app.use((req, res, next) => {
	const origin = req.headers.origin as string;

	if (allowedOrigins.includes(origin)) {
		res.header('Access-Control-Allow-Origin', origin);
	}

	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');

	// For preflight requests
	if (req.method === 'OPTIONS') {
		return res.status(204).end();
	}

	next();
});

app.use('/tmp', express.static('tmp'));

// Middleware to track session activity
const updateSessionActivity = (req: Request, res: Response, next: NextFunction) => {
	if (req.session) {
		(req.session as SessionData).lastAccessed = Date.now();
	}
	next();
};

app.use(updateSessionActivity);

// Function to check and clean up inactive sessions
const checkActiveSessions = () => {
	const sessionDuration = 60 * 60 * 1000; // 1 hour in milliseconds

	const currentTime = Date.now();

	const sessionIds = inMemoryStore.getAllSessionIds();

	cleanInactiveSpaces(sessionIds);

	inMemoryStore.getAllSessionIds().forEach(sid => {
		const session = inMemoryStore.getSession(sid);

		if (session && currentTime - (session.lastAccessed || 0) > sessionDuration) {
			inMemoryStore.destroy(sid, err => {
				removeUserSpace(sid);
				if (err) {
					console.error(`Failed to destroy session ${sid}:`, err);
				} else {
					console.log(`Session ${sid} has been expired and cleaned up.`);
				}
			});
		}
	});
};

// Schedule session cleanup every hour
cron.schedule('0 * * * *', checkActiveSessions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/', routes);

app.get('/session', (req, res) => {
	const sessions = inMemoryStore.getAllSessionIds();

	res.send(sessions);
});

app.get('/:universalURL', (_req: Request, res: Response) => {
	res.send('404 URL NOT FOUND');
});

// Set the port number for the server
const port = 3000;

// Start the server and listen on the specified port
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
