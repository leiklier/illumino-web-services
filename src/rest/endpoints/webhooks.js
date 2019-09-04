const childProcess = require('child_process')
const HttpStatus = require('http-status-codes')
const crypto = require('crypto')

const { GITHUB_SECRET } = process.env

module.exports = async app => {
	app.post('/webhooks/github', verifyThatGithubIsSender, async (req, res) => {
		deploy()
		res.status(HttpStatus.OK).send()
	})
}

function verifyThatGithubIsSender(req, res, next) {
	const sigHeaderName = 'X-Hub-Signature'
	const payload = JSON.stringify(req.body)

	if (!payload) {
		return res.status(HttpStatus.UNAUTHORIZED).send()
	}

	const hmac = crypto.createHmac('sha1', GITHUB_SECRET)
	const digest = 'sha1=' + hmac.update(payload).digest('hex')
	const checksum = req.get(sigHeaderName)

	if (!checksum || !digest || checksum !== digest) {
		return res.status(HttpStatus.UNAUTHORIZED).send()
	}

	return next()
}

async function deploy() {
	await new Promise((resolve, reject) =>
		childProcess.exec(
			`cd ${global.appRoot} && ./deploy.sh`,
			(err, stdout, stderr) => {
				if (err) {
					reject(err)
				}
				resolve()
			},
		),
	)
}
