import { controller, httpGet, httpPost } from "inversify-express-utils";
import { Request, Response } from "express";
import { inject } from "inversify";
import { LeadService } from "../services/lead.service";

@controller("")
export class LeadController {
    constructor(
        @inject(LeadService) private _leadService: LeadService
    ) { }

    @httpPost("/analyze")
    async analyze(req: Request, res: Response) {
        const result = await this._leadService.analyze();
        return res.send(result);
    }

    @httpGet("/leadSummary")
    async leadSummary(req: Request, res: Response) {
        try {
            return res.send(this._leadService.getSummary());
        } catch (error) {
            return res.status(404).send({ error: (error as Error).message });
        }
    }

    @httpGet("/lead/:leadPhoneNumber")
    async leadByPhone(req: Request, res: Response) {
        try {
            const profile = this._leadService.getLeadByPhone(req.params.leadPhoneNumber);
            if (!profile) {
                return res.status(404).send({ error: "Lead not found" });
            }
            return res.send(profile);
        } catch (error) {
            return res.status(404).send({ error: (error as Error).message });
        }
    }
}
